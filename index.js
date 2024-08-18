const express=require('express');
const chokidar=require('chokidar');
const Excel=require('exceljs');
const dayjs=require('dayjs');
const {PrismaClient}=require('@prisma/client')
const path=require('path')
const app=express();
const folderPath='C:/Users/91908/Desktop/New folder (12)'

const prisma=new PrismaClient();

const regexExtract=()=>{
    const today=dayjs().format('YYYY-MM-DD');
    return new RegExp(`${today}.*\\.xlsx$`);

}
const processData=async(filePath)=>{
    const excel=new Excel.Workbook();
    await excel.xlsx.readFile(filePath);
    const worksheet=excel.getWorksheet(1);

    const headers=[];
    worksheet.getRow(1).eachCell((col,colNumber)=>{
        headers[colNumber]=col.value;
    })

const rows=[];
 
    worksheet.eachRow((row,rowNumber)=>{
        if(rowNumber>1){
            const rowObj={};
            row.eachCell((col,colNumber)=>{
                rowObj[headers[colNumber]]=col.value
            })
            rows.push(rowObj);
           
 
          
        }
    })
    await prisma.user.createMany({ data: rows });
    console.log('done');
}
chokidar.watch(folderPath,{persistent:true}).on('add',(filePath)=>{
    if(regexExtract().test(path.basename(filePath))){
        processData(filePath)

    }

})

app.listen(3006,()=>{
    console.log('listening on the server 3006')
})