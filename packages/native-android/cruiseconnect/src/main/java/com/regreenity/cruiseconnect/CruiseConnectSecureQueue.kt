package com.regreenity.cruiseconnect

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.AtomicFile
import java.io.DataInputStream
import java.io.DataOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class CruiseConnectSecureQueue(context: Context, sailingReference: String) {
    private val safe = sailingReference.replace(Regex("[^A-Za-z0-9_-]"), "_")
    private val alias = "cruiseconnect_queue_$safe"
    private val file = AtomicFile(context.noBackupFilesDir.resolve("cruiseconnect-$safe.queue"))

    @Synchronized fun write(cleartext: ByteArray) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.doFinal(cleartext)
        val stream = file.startWrite()
        try {
            DataOutputStream(stream).use { output -> output.writeInt(cipher.iv.size); output.write(cipher.iv); output.writeInt(encrypted.size); output.write(encrypted) }
            file.finishWrite(stream)
        } catch (error: Throwable) { file.failWrite(stream); throw error }
    }

    @Synchronized fun read(): ByteArray? {
        if (!file.baseFile.exists()) return null
        DataInputStream(file.openRead()).use { input ->
            val ivSize = input.readInt().also { require(it in 12..16) }
            val iv = ByteArray(ivSize).also(input::readFully)
            val encryptedSize = input.readInt().also { require(it in 1..5_000_000) }
            val encrypted = ByteArray(encryptedSize).also(input::readFully)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, iv))
            return cipher.doFinal(encrypted)
        }
    }

    @Synchronized fun purge() {
        file.delete()
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (keyStore.containsAlias(alias)) keyStore.deleteEntry(alias)
    }

    private fun key(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").run {
            init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256).setUserAuthenticationRequired(false).build())
            generateKey()
        }
    }
}
