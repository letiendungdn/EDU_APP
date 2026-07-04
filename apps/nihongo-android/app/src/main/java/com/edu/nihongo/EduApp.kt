package com.edu.nihongo

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import io.livekit.android.LiveKit

@HiltAndroidApp
class EduApp : Application() {
    override fun onCreate() {
        super.onCreate()
        LiveKit.init(this)
    }
}
