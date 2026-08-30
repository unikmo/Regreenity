package com.regreenity.cruiseconnect

import android.webkit.JavascriptInterface
import android.webkit.WebView

fun interface CruiseConnectHost { fun handle(messageJson: String) }
class CruiseConnectBridge(private val host: CruiseConnectHost) {
    @JavascriptInterface fun postMessage(messageJson: String) = host.handle(messageJson)
    fun install(webView: WebView) {
        webView.settings.javaScriptEnabled = true
        webView.addJavascriptInterface(this, "CruiseConnectNative")
    }
    fun uninstall(webView: WebView) = webView.removeJavascriptInterface("CruiseConnectNative")
}
