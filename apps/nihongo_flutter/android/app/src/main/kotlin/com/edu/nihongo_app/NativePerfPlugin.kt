package com.edu.nihongo_app

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Handler
import android.os.Looper
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors
import kotlin.math.max
import kotlin.math.min

/**
 * Ví dụ tối ưu hiệu năng qua native (Android):
 * - concatenateYuvPlanes: gộp plane camera trên thread pool (tránh block UI isolate)
 * - downscaleJpeg: resize ảnh trước OCR (ít pixel hơn → ML Kit nhanh hơn)
 * - getSuggestedScanIntervalMs: throttle adaptive theo CPU/RAM thiết bị
 */
object NativePerfPlugin {
    private const val CHANNEL = "com.edu.nihongo/native_perf"
    private val executor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    fun register(flutterEngine: FlutterEngine) {
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler(::onMethodCall)
    }

    private fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "concatenateYuvPlanes" -> executor.execute {
                try {
                    @Suppress("UNCHECKED_CAST")
                    val planes = call.argument<List<ByteArray>>("planes")
                    if (planes.isNullOrEmpty()) {
                        postError(result, "INVALID", "planes empty")
                        return@execute
                    }
                    val total = planes.sumOf { it.size }
                    val out = ByteArray(total)
                    var offset = 0
                    for (plane in planes) {
                        System.arraycopy(plane, 0, out, offset, plane.size)
                        offset += plane.size
                    }
                    postSuccess(result, out)
                } catch (e: Exception) {
                    postError(result, "NATIVE_ERROR", e.message)
                }
            }

            "downscaleJpeg" -> executor.execute {
                try {
                    val bytes = call.argument<ByteArray>("bytes")
                    val maxWidth = call.argument<Int>("maxWidth") ?: 960
                    if (bytes == null) {
                        postError(result, "INVALID", "bytes null")
                        return@execute
                    }

                    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

                    var sample = 1
                    while (bounds.outWidth / sample > maxWidth) {
                        sample *= 2
                    }

                    val decodeOpts = BitmapFactory.Options().apply { inSampleSize = sample }
                    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, decodeOpts)
                        ?: run {
                            postError(result, "DECODE_FAILED", "bitmap null")
                            return@execute
                        }

                    val targetW = min(bitmap.width, maxWidth)
                    val targetH = (bitmap.height * (targetW.toFloat() / bitmap.width)).toInt()
                    val scaled = Bitmap.createScaledBitmap(bitmap, targetW, max(targetH, 1), true)
                    if (scaled != bitmap) bitmap.recycle()

                    val stream = ByteArrayOutputStream()
                    scaled.compress(Bitmap.CompressFormat.JPEG, 75, stream)
                    scaled.recycle()

                    postSuccess(result, stream.toByteArray())
                } catch (e: Exception) {
                    postError(result, "NATIVE_ERROR", e.message)
                }
            }

            "getSuggestedScanIntervalMs" -> {
                val cores = Runtime.getRuntime().availableProcessors()
                val ramGb = Runtime.getRuntime().maxMemory() / (1024.0 * 1024.0 * 1024.0)
                val interval = when {
                    cores >= 8 && ramGb >= 4 -> 700L
                    cores >= 4 -> 900L
                    else -> 1200L
                }
                result.success(interval)
            }

            "getDevicePerfHint" -> {
                val hint = mapOf(
                    "cores" to Runtime.getRuntime().availableProcessors(),
                    "sdkInt" to Build.VERSION.SDK_INT,
                    "manufacturer" to Build.MANUFACTURER,
                    "model" to Build.MODEL,
                )
                result.success(hint)
            }

            else -> result.notImplemented()
        }
    }

    private fun postSuccess(result: MethodChannel.Result, value: Any?) {
        mainHandler.post { result.success(value) }
    }

    private fun postError(result: MethodChannel.Result, code: String, message: String?) {
        mainHandler.post { result.error(code, message, null) }
    }
}
