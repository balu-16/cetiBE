import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '../supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CertificateGenerator {
  constructor() {
    // Define base paths for templates
    this.possibleBasePaths = [
      path.join(__dirname, '../../public/certificates/'),
      path.join(process.cwd(), 'public/certificates/'),
      path.join(process.cwd(), 'gps-backend/../public/certificates/'),
      path.join(__dirname, '../'), // Backend directory for fallback
      path.join(process.cwd(), ''), // Root directory
      './',
      './public/certificates/'
    ];
  }

  /**
   * Find and load the appropriate template file based on company name
   */
  async loadTemplate(companyName) {
    // Determine which template to use based on company name
    let templateFileName;
    if (companyName && companyName.toLowerCase() === 'addwise tech innovations') {
      templateFileName = 'template2.png';
      console.log('🏢 Using template2.png for AddWise Tech Innovations');
    } else {
      templateFileName = 'template1.png';
      console.log('🏢 Using template1.png for default/other companies');
    }

    // Try to find the template in possible paths
    for (const basePath of this.possibleBasePaths) {
      try {
        const templatePath = path.join(basePath, templateFileName);
        console.log(`🔍 Trying template path: ${templatePath}`);
        const templateImageBytes = await fs.readFile(templatePath);
        console.log(`✅ Template loaded from: ${templatePath}`);
        return templateImageBytes;
      } catch (error) {
        console.log(`❌ Template not found at: ${path.join(basePath, templateFileName)}`);
        continue;
      }
    }
    
    // If no template found, create a simple colored background
    console.log('⚠️ No template found, creating simple background');
    return null;
  }

  /**
   * Format date from YYYY-MM-DD to "1 July 2025" format
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }

  /**
   * Generate QR code as PNG buffer
   */
  async generateQRCode(certificateId) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(certificateId, {
        type: 'png',
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeBuffer;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate certificate for a student
   */
  async generateCertificate(studentData) {
    try {
      console.log('🎓 Starting certificate generation for:', studentData.name);
      
      // Create a new PDF document with landscape orientation (11" x 8.5")
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([792, 612]); // 11" x 8.5" in points (72 points per inch)
      const { width, height } = page.getSize();
      
      console.log(`📄 PDF dimensions: ${width} x ${height}`);
      
      // Try to load template based on company name, fallback to simple background if not found
      const templateImageBytes = await this.loadTemplate(studentData.company_name);
      
      if (templateImageBytes) {
        try {
          const templateImage = await pdfDoc.embedPng(templateImageBytes);
          
          // Draw the template as background covering the entire page
          page.drawImage(templateImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
          });
          
          console.log('✅ Template background added');
        } catch (error) {
          console.log('⚠️ Failed to embed template, using simple background:', error.message);
          // Create a simple gradient background
          page.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: height,
            color: rgb(0.98, 0.98, 0.98), // Light gray background
          });
        }
      } else {
        // Create a simple elegant background
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(0.98, 0.98, 0.98), // Light gray background
        });
        
        // Add a border
        page.drawRectangle({
          x: 20,
          y: 20,
          width: width - 40,
          height: height - 40,
          borderColor: rgb(0.2, 0.2, 0.2),
          borderWidth: 2,
        });
        
        console.log('✅ Simple background created');
      }
      
      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      // Add student name (positioned as per your template)
      const studentNameFontSize = 48;
      const studentNameWidth = timesRomanBoldFont.widthOfTextAtSize(studentData.name, studentNameFontSize);
      page.drawText(studentData.name, {
        x: width / 2 - studentNameWidth / 2, // Center horizontally
        y: height - 248, // 3.45in from top (3.45 * 72 = 248.4)
        size: studentNameFontSize,
        font: timesRomanBoldFont,
        color: rgb(0.2, 0.2, 0.2), // Dark gray
      });
      
      console.log('✅ Student name added:', studentData.name);
      
      // Add completion text with course and company information
      const completionText = `has successfully completed a ${studentData.course_name || 'FULL STACK DEVELOPMENT'} program at`;
      const completionFontSize = 20;
      const completionWidth = timesRomanFont.widthOfTextAtSize(completionText, completionFontSize);
      page.drawText(completionText, {
        x: width / 2 - completionWidth / 2,
        y: height - 317, // 4.4in from top
        size: completionFontSize,
        font: timesRomanFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Add company name
      const companyName = studentData.company_name || 'ADDWISE TECH INNOVATIONS';
      const companyFontSize = 20;
      const companyWidth = timesRomanBoldFont.widthOfTextAtSize(companyName, companyFontSize);
      page.drawText(companyName, {
        x: width / 2 - companyWidth / 2,
        y: height - 345, // Below completion text
        size: companyFontSize,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      
      // Add date range
      const startDate = studentData.start_date ? this.formatDate(studentData.start_date) : 'MAY 20, 2025';
      const endDate = studentData.end_date ? this.formatDate(studentData.end_date) : 'JULY 20, 2025';
      const dateText = `FROM ${startDate} TO ${endDate}`;
      const dateFontSize = 20;
      const dateWidth = timesRomanFont.widthOfTextAtSize(dateText, dateFontSize);
      page.drawText(dateText, {
        x: width / 2 - dateWidth / 2,
        y: height - 373, // Below company name
        size: dateFontSize,
        font: timesRomanFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      console.log('✅ Certificate text added');
      
      // Generate and embed QR code
      const qrCodeBuffer = await this.generateQRCode(studentData.certificate_id);
      const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);
      
      // Add QR code to top-right corner (positioned as per your template)
      const qrSize = 120;
      page.drawImage(qrCodeImage, {
        x: width - qrSize - 86, // 1.2in from right (1.2 * 72 = 86.4)
        y: height - qrSize - 86, // 1.2in from top
        width: qrSize,
        height: qrSize,
      });
      
      console.log('✅ QR code added');
      
      // Add certificate ID text (positioned below QR code)
      const certIdText = `Certificate ID: ${studentData.certificate_id}`;
      const certIdFontSize = 10;
      page.drawText(certIdText, {
        x: width - 200, // Align with QR code area
        y: height - qrSize - 110, // Below QR code
        size: certIdFontSize,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Add issued date
      const issuedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const issuedText = `Issued: ${issuedDate}`;
      page.drawText(issuedText, {
        x: width - 200, // Align with QR code area
        y: height - qrSize - 125, // Below certificate ID
        size: certIdFontSize,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      console.log('✅ Certificate metadata added');
      
      // Save the PDF as bytes
      const pdfBytes = await pdfDoc.save();
      
      console.log(`📊 Generated PDF size: ${pdfBytes.length} bytes`);
      
      return pdfBytes;
      
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }

  /**
   * Generate certificate and save to database
   */
  async generateAndSaveCertificate(studentId) {
    try {
      console.log(`🔍 Fetching student data for ID: ${studentId}`);
      
      // Fetch student data from Supabase
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .single();
      
      if (fetchError) {
        console.error('❌ Error fetching student:', fetchError);
        throw new Error(`Failed to fetch student: ${fetchError.message}`);
      }
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      console.log('👤 Student found:', student.name);
      
      // Validate required fields
      const requiredFields = ['name', 'certificate_id'];
      const missingFields = requiredFields.filter(field => !student[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Generate certificate PDF
      const certificateBytes = await this.generateCertificate(student);
      
      // Convert to Uint8Array for database storage
      const certificateBuffer = new Uint8Array(certificateBytes);
      
      console.log('💾 Saving certificate to database...');
      
      // Update student record with certificate
      const { data: updateData, error: updateError } = await supabase
        .from('students')
        .update({ 
          certificate: certificateBuffer
        })
        .eq('student_id', studentId)
        .select();
      
      if (updateError) {
        console.error('❌ Error saving certificate:', updateError);
        throw new Error(`Failed to save certificate: ${updateError.message}`);
      }
      
      console.log('✅ Certificate generated and saved successfully!');
      
      return {
        success: true,
        message: 'Certificate generated and saved successfully',
        student: student.name,
        certificateId: student.certificate_id,
        size: certificateBytes.length
      };
      
    } catch (error) {
      console.error('❌ Certificate generation process failed:', error);
      throw error;
    }
  }

  /**
   * Get certificate from database
   */
  async getCertificate(studentId) {
    try {
      console.log(`🔍 Fetching certificate for student ID: ${studentId}`);
      
      const { data: student, error } = await supabase
        .from('students')
        .select('certificate, name, certificate_id')
        .eq('student_id', studentId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching certificate:', error);
        throw new Error(`Failed to fetch certificate: ${error.message}`);
      }
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      if (!student.certificate) {
        throw new Error('Certificate not found for this student');
      }
      
      console.log('✅ Certificate found for:', student.name);
      
      return {
        success: true,
        certificate: student.certificate,
        studentName: student.name,
        certificateId: student.certificate_id
      };
      
    } catch (error) {
      console.error('❌ Get certificate error:', error);
      throw error;
    }
  }
}

export default CertificateGenerator;