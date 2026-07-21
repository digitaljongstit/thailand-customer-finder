# Thailand Customer Finder

เว็บแอปสำหรับค้นหาบริษัท/ลูกค้าในประเทศไทยจากพิกัด Latitude, Longitude และรัศมีที่กำหนด พร้อมฟอร์มเพิ่ม แก้ไข ลบข้อมูล และนำเข้าข้อมูลจาก CSV โดยแสดงผลตำแหน่งบนแผนที่ Leaflet/OpenStreetMap

## คุณสมบัติหลัก

- ค้นหาบริษัทจาก Latitude, Longitude และรัศมีเป็นกิโลเมตร
- แสดงผลลัพธ์เรียงตามระยะทางใกล้ที่สุด
- เพิ่ม แก้ไข และลบบริษัทผ่านหน้าเว็บ
- นำเข้า CSV ที่มีคอลัมน์ `name, category, latitude, longitude, address` และเลือกใส่ `id` ได้
- แสดง marker ของบริษัทบน Leaflet map พร้อม popup รายละเอียดบริษัท
- Build เป็น static web app ในโฟลเดอร์ `dist/`

## ความต้องการระบบ

- Node.js 20 ขึ้นไป
- npm
- อินเทอร์เน็ตสำหรับโหลด Leaflet assets และ OpenStreetMap tiles เมื่อเปิดหน้าเว็บ

## วิธีติดตั้ง

```bash
npm install
```

> โปรเจกต์นี้ไม่พึ่งพา npm package ภายนอกเพื่อให้ติดตั้งได้ในสภาพแวดล้อมที่จำกัด registry แต่ยังใช้ TypeScript compiler จาก environment สำหรับ build

## วิธีรันระหว่างพัฒนา

```bash
npm run dev
```

จากนั้นเปิดเว็บที่:

```text
http://localhost:5173
```

## วิธี Build

```bash
npm run build
```

ไฟล์สำหรับ deploy จะอยู่ใน:

```text
dist/
```

## วิธีทดสอบ

```bash
npm test
```

ชุดทดสอบครอบคลุมการค้นหาด้วย Latitude/Longitude/รัศมี และ workflow เพิ่ม แก้ไข ลบ รวมถึงนำเข้า CSV

## รูปแบบ CSV

ตัวอย่างไฟล์ CSV:

```csv
name,category,latitude,longitude,address
Test Co,Technology,13.756331,100.501762,Bangkok
```

คอลัมน์ที่ต้องมี:

- `name`
- `category`
- `latitude`
- `longitude`
- `address`

คอลัมน์เสริม:

- `id` ถ้าไม่ใส่ ระบบจะสร้าง id ให้อัตโนมัติ

## การใช้งานแผนที่ Leaflet

หน้าเว็บโหลด Leaflet CSS/JS จาก CDN และใช้ OpenStreetMap tile layer โดย marker จะปรับ bounds ตามรายการบริษัทที่กำลังแสดง ถ้า Leaflet โหลดไม่สำเร็จ ระบบจะแสดงข้อความแจ้งเตือนในช่องสถานะ
