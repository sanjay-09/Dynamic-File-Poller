const express = require('express');
const chokidar = require('chokidar');
const ExcelJS = require('exceljs');
const prisma = require('@prisma/client').PrismaClient;
const dayjs = require('dayjs');
const path = require('path');

const app = express();
const prismaClient = new prisma();

const folderPath = 'C:/Users/91908/Desktop/New folder (12)';  // Replace with your folder path

// Helper function to match file names with today's date
function getTodayRegex() {
  const today = dayjs().format('YYYY-MM-DD');
  return new RegExp(`${today}.*\\.xlsx$`);
}

// Function to read Excel and store data in the database
async function processFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  console.log(workbook);
  const worksheet = workbook.getWorksheet(1);  // Read the first sheet
  
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {  // Assuming the first row is the header
      rows.push({
        Name: row.getCell(1).value,
        Profession: row.getCell(2).value,
        // Map more cells as needed
      });
    }
  });

  await prismaClient.user.createMany({ data: rows });
  console.log(`Data from ${path.basename(filePath)} stored in the database.`);
}

// Watch the folder for new files
chokidar.watch(folderPath, { persistent: true }).on('add', filePath => {
  if (getTodayRegex().test(path.basename(filePath))) {
    console.log("regex",getTodayRegex())
     console.log(filePath);
    processFile(filePath).catch(console.error);
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
