import { ocr } from "llama-ocr";
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch'; 
import FormData from 'form-data';
import 'dotenv/config'; 

async function processOCR() {
  try {
    const filePath = path.join(process.cwd(), './facturas/factura2.jpg'); 
    const markdown = await ocr({
      filePath: filePath,
      apiKey: process.env.LLAMA_OCR_API_KEY, 
    });
    console.log(markdown);

    const baseName = path.basename(filePath, path.extname(filePath));
    const outputFilePath = path.join(process.cwd(), `${baseName}.md`);
    await fs.writeFile(outputFilePath, markdown);
    console.log(`Output saved to: ${outputFilePath}`);

    const formData = new FormData();
    formData.append('data', markdown);
    formData.append('output[doubleQuote]', 'true');
    formData.append('output[valueDelimiter]', ',');
    formData.append('output[rowDelimiter]', 'NEWLINE');
    formData.append('output[prefix]', '');
    formData.append('output[suffix]', '');

    const response = await fetch('https://api.tableconvert.com/v2/convert/markdown-to-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BEARER_API_KEY}` 
      },
      body: formData
    });

    const csvContent = await response.text();
    const csvOutputPath = path.join(process.cwd(), `${baseName}.csv`);
    await fs.writeFile(csvOutputPath, csvContent);
    console.log(`CSV exported to: ${csvOutputPath}`);

  } catch (error) {
    console.error("Error processing OCR:", error);
  }
}

processOCR();