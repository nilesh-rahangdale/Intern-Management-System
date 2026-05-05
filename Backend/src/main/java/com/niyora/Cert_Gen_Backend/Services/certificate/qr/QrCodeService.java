package com.niyora.Cert_Gen_Backend.Services.certificate.qr;


import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class QrCodeService {




    public BufferedImage generateQrImage(String payload) throws Exception {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);

        BitMatrix matrix = new QRCodeWriter().encode(
                payload,
                BarcodeFormat.QR_CODE,
                250,
                250,
                hints
        );

        return MatrixToImageWriter.toBufferedImage(matrix);
    }


}
