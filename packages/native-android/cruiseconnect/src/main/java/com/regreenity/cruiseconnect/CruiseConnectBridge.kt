package com.regreenity.cruiseconnect

import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebSettings
import java.lang.ref.WeakReference

fun interface CruiseConnectHost { fun handle(messageJson: String) }
class CruiseConnectBridge(private val host: CruiseConnectHost, trustedOrigin: String) {
    private val expected = Uri.parse(trustedOrigin)
    private var webView = WeakReference<WebView>(null)
    init { require(expected.scheme == "https" && !expected.host.isNullOrBlank()) { "CruiseConnect requires an HTTPS trusted origin" } }
    @JavascriptInterface fun postMessage(messageJson: String) {
        val current = webView.get()?.url?.let(Uri::parse) ?: return
        val expectedPort = if (expected.port == -1) 443 else expected.port
        val currentPort = if (current.port == -1) 443 else current.port
        if (current.scheme == expected.scheme && current.host == expected.host && currentPort == expectedPort) host.handle(messageJson)
    }
    fun install(webView: WebView) {
        this.webView = WeakReference(webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.allowFileAccess = false
        webView.settings.allowContentAccess = false
        webView.settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        webView.settings.safeBrowsingEnabled = true
        webView.addJavascriptInterface(this, "CruiseConnectNative")
    }
    fun uninstall(webView: WebView) { webView.removeJavascriptInterface("CruiseConnectNative"); this.webView.clear() }
}
