package com.niyora.Cert_Gen_Backend.Services.certificate.ceritificateGenerator;


import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.fop.svg.PDFTranscoder;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
public class CertificatePdfGeneratorService {

    @Value("${certificate.storage.pdf.path}")
    private String baseDir;

    private static final String SVG_TEMPLATE_PATH = "static/images/bg1.svg";

    @Transactional
    public Path generateUnsignedPdf(Certificate certificate) throws Exception {
        // Create directory if it doesn't exist
        Path directoryPath = Path.of(baseDir);
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
            log.info("Created directory: {}", directoryPath.toAbsolutePath());
        }

        String fileName = certificate.getCertificateId() + ".pdf";
        Path pdfPath = directoryPath.resolve(fileName);

        Document document = null;
        PdfWriter writer = null;
        FileOutputStream fos = null;

        try {
            fos = new FileOutputStream(pdfPath.toFile());
            // A4 size in points: 595 x 842
            // Our SVG is 2480 x 3508 (A4 at 300 DPI)
            document = new Document(PageSize.A4, 0, 0, 0, 0);
            writer = PdfWriter.getInstance(document, fos);
            document.open();

            PdfContentByte canvas = writer.getDirectContent();
            
            // Convert SVG to PDF and use as background
            addSvgBackground(canvas, document);

            // Add dynamic text content on top of the SVG background
            addCertificateContent(document, canvas, certificate);

            log.info("PDF generated successfully at: {}", pdfPath.toAbsolutePath());

        } catch (DocumentException | IOException e) {
            log.error("Error generating PDF for certificate {}: {}", certificate.getCertificateId(), e.getMessage());
            throw new Exception("Failed to generate PDF: " + e.getMessage(), e);
        } finally {
            if (document != null && document.isOpen()) {
                document.close();
            }
        }

        return pdfPath;
    }

    private void addSvgBackground(PdfContentByte canvas, Document document) throws IOException {
        try {
            // Load SVG from classpath
            ClassPathResource svgResource = new ClassPathResource(SVG_TEMPLATE_PATH);
            
            // Read SVG content
            String svgContent;
            try (InputStream inputStream = svgResource.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"))) {
                svgContent = reader.lines()
                        .reduce("", (acc, line) -> acc + line + "\n");
            }

            // Create a temporary file for the converted PDF
            File tempPdfFile = File.createTempFile("svg_bg_", ".pdf");
            tempPdfFile.deleteOnExit();

            // Convert SVG to PDF using Apache FOP
            try (ByteArrayInputStream svgInputStream = new ByteArrayInputStream(svgContent.getBytes("UTF-8"));
                 FileOutputStream pdfOutputStream = new FileOutputStream(tempPdfFile)) {
                
                PDFTranscoder transcoder = new PDFTranscoder();
                
                // Configure transcoder for better font handling
                transcoder.addTranscodingHint(PDFTranscoder.KEY_AUTO_FONTS, Boolean.TRUE);
                
                TranscoderInput input = new TranscoderInput(svgInputStream);
                TranscoderOutput output = new TranscoderOutput(pdfOutputStream);
                transcoder.transcode(input, output);
            }

            // Read the converted PDF and add it as a background
            PdfReader reader = new PdfReader(tempPdfFile.getAbsolutePath());
            PdfImportedPage page = canvas.getPdfWriter().getImportedPage(reader, 1);
            
            // Scale and position to fit A4
            float scaleX = document.getPageSize().getWidth() / page.getWidth();
            float scaleY = document.getPageSize().getHeight() / page.getHeight();
            float scale = Math.min(scaleX, scaleY);
            
            canvas.addTemplate(page, scale, 0, 0, scale, 0, 0);
            reader.close();

            log.info("SVG background added successfully");
        } catch (Exception e) {
            log.error("Error adding SVG background: {}", e.getMessage());
            throw new IOException("Failed to add SVG background", e);
        }
    }

    private void addCertificateContent(Document document, PdfContentByte canvas, Certificate certificate) throws DocumentException {
        try {
            // Get page dimensions
            float pageWidth = document.getPageSize().getWidth();
            float pageHeight = document.getPageSize().getHeight();

            // Create fonts
            BaseFont baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            BaseFont baseFontBold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);



            // Add intern name
            canvas.beginText();
            canvas.setFontAndSize(baseFontBold, 14);
            String name = certificate.getIntern().getFullName();
            float nameWidth = baseFontBold.getWidthPoint(name, 14);
            // Position corresponds to the name field in SVG (around y=1150)
            float nameY = pageHeight - (1150 * pageHeight / 3508);
            canvas.setTextMatrix((pageWidth - nameWidth) / 2, nameY);
            canvas.showText(name);
            canvas.endText();

            // Add institute name
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 12);
            String institute = certificate.getIntern().getInstituteName() != null ?
                    certificate.getIntern().getInstituteName() : "";
            // Position for institute field (around y=1250)
            float instituteY = pageHeight - (1250 * pageHeight / 3508);
            canvas.setTextMatrix(530 * pageWidth / 2480, instituteY);
            canvas.showText(institute);
            canvas.endText();

            // Add branch
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 12);
            String branch = certificate.getIntern().getDomain() != null ?
                    certificate.getIntern().getDomain() : "";
            float branchY = pageHeight - (1380 * pageHeight / 3508);
            canvas.setTextMatrix(450 * pageWidth / 2480, branchY);
            canvas.showText(branch);
            canvas.endText();

            // Add roll number
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 12);
            String rollNo = certificate.getIntern().getRollNumber() != null ? 
                    certificate.getIntern().getRollNumber() : "";
            canvas.setTextMatrix(1300 * pageWidth / 2480, branchY);
            canvas.showText(rollNo);
            canvas.endText();

            // Add dates
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 12);
            String startDate = certificate.getIntern().getStartDate() != null ? 
                    certificate.getIntern().getStartDate().toString() : "";
            float durationY = pageHeight - (1510 * pageHeight / 3508);
            canvas.setTextMatrix(1150 * pageWidth / 2480, durationY);
            canvas.showText(startDate);
            canvas.endText();

            canvas.beginText();
            String endDate = certificate.getIntern().getEndDate() != null ? 
                    certificate.getIntern().getEndDate().toString() : "";
            canvas.setTextMatrix(1600 * pageWidth / 2480, durationY);
            canvas.showText(endDate);
            canvas.endText();

            // Add topic
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 11);
            String topic = certificate.getIntern().getProjectTitle() != null ? 
                    certificate.getIntern().getProjectTitle() : "";
            float topicY = pageHeight - (1640 * pageHeight / 3508);
            canvas.setTextMatrix(720 * pageWidth / 2480, topicY);
            
            // Handle long topic text (wrap if needed)
            float maxWidth = (2180 - 720) * pageWidth / 2480;
            if (baseFont.getWidthPoint(topic, 11) > maxWidth) {
                topic = topic.substring(0, Math.min(topic.length(), 100)) + "...";
            }
            canvas.showText(topic);
            canvas.endText();

            // Add certificate ID and date in header
            canvas.beginText();
            canvas.setFontAndSize(baseFont, 10);
            String certId = "Certificate Id: " + certificate.getCertificateId();
            float certIdY = pageHeight - (230 * pageHeight / 3508);
            canvas.setTextMatrix(2250 * pageWidth / 2480 - baseFont.getWidthPoint(certId, 10), certIdY);
            canvas.showText(certId);
            canvas.endText();

            canvas.beginText();
            String issueDate = "Date: " + (certificate.getIssueDate() != null ? 
                    certificate.getIssueDate().toString() : "");
            float dateY = pageHeight - (270 * pageHeight / 3508);
            canvas.setTextMatrix(2250 * pageWidth / 2480 - baseFont.getWidthPoint(issueDate, 10), dateY);
            canvas.showText(issueDate);
            canvas.endText();

            log.info("Certificate content added successfully");
        } catch (Exception e) {
            log.error("Error adding certificate content: {}", e.getMessage());
            throw new RuntimeException("Failed to add certificate content", e);
        }
    }
}