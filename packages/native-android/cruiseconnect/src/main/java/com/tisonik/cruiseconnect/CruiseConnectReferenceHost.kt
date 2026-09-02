package com.tisonik.cruiseconnect

import org.json.JSONObject

class CruiseConnectReferenceHost(private val queue: CruiseConnectSecureQueue) : CruiseConnectHost {
    override fun handle(messageJson: String) {
        val message = JSONObject(messageJson)
        require(message.has("type")) { "CruiseConnect message requires a type" }
        queue.write(message.toString().toByteArray(Charsets.UTF_8))
    }
}
