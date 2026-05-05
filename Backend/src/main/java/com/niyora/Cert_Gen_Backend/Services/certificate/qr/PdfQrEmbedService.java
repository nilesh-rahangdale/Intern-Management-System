package com.niyora.Cert_Gen_Backend.Services.certificate.qr;


import com.lowagie.text.Image;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class PdfQrEmbedService {

//    public Path embedQr(Path inputPdf, Path qrImage) throws Exception {
//
//        PdfReader reader = new PdfReader(inputPdf.toString());
//
//        Path outputPdf = Path.of(
//                inputPdf.toString().replace(".pdf", "_qr.pdf")
//        );
//
//        PdfStamper stamper = new PdfStamper(
//                reader,
//                new FileOutputStream(outputPdf.toFile())
//        );
//
//        Image qr = Image.getInstance(qrImage.toString());
//        qr.scaleAbsolute(80, 80);
//        com.lowagie.text.Rectangle pageSize = reader.getPageSize(reader.getNumberOfPages());
//        float x = pageSize.getLeft() + 40f; // distance from left edge
//        float y = pageSize.getBottom() + 60f; // distance from bottom edge
//        qr.setAbsolutePosition(x, y); // bottom-left corner
//        PdfContentByte canvas = stamper.getOverContent(reader.getNumberOfPages());
//        canvas.addImage(qr);
//
//        stamper.close();
//        reader.close();
//
//        return outputPdf;
//    }

    public Path embedQr(Path inputPdf, BufferedImage qrImage) throws Exception {
        PdfReader reader = new PdfReader(inputPdf.toString());

        Path outputPdf = Path.of(
                inputPdf.toString().replace(".pdf", "_qr.pdf")
        );

        PdfStamper stamper = new PdfStamper(
                reader,
                new FileOutputStream(outputPdf.toFile())
        );

        // Convert BufferedImage to iText Image
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "PNG", baos);
        Image qr = Image.getInstance(baos.toByteArray());

        qr.scaleAbsolute(80, 80);
        com.lowagie.text.Rectangle pageSize = reader.getPageSize(reader.getNumberOfPages());
        float x = pageSize.getLeft() + 40f;
        float y = pageSize.getBottom() + 60f;
        qr.setAbsolutePosition(x, y);

        PdfContentByte canvas = stamper.getOverContent(reader.getNumberOfPages());
        canvas.addImage(qr);

        stamper.close();
        reader.close();

        return outputPdf;
    }

}
