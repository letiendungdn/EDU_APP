package com.edu.nihongo.data

import com.edu.nihongo.data.remote.LiveJoinDto
import javax.inject.Inject
import javax.inject.Singleton

/** Truyền token/wsUrl giữa màn hình — tránh đặt JWT trên navigation route. */
@Singleton
class LiveNavigationStore @Inject constructor() {
    var pendingJoin: LiveJoinDto? = null

    fun setJoin(join: LiveJoinDto) {
        pendingJoin = join
    }

    fun consumeJoin(): LiveJoinDto? {
        val join = pendingJoin
        pendingJoin = null
        return join
    }
}
