package com.edu.nihongo.utils

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

object TtsHelper {
    private var tts: TextToSpeech? = null
    private val ready = AtomicBoolean(false)

    fun init(context: Context) {
        if (tts != null) return
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.JAPANESE
                tts?.setSpeechRate(0.9f)
                ready.set(true)
            }
        }
    }

    fun speak(text: String) {
        val engine = tts ?: return
        if (!ready.get() || text.isBlank()) return
        engine.speak(text.trim(), TextToSpeech.QUEUE_FLUSH, null, "nihongo-tts")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        ready.set(false)
    }
}
