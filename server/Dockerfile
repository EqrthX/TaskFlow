FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl
# 1. ก๊อปปี้แค่ไฟล์ package มาก่อน
COPY package*.json ./

# 2. ลง Package
RUN npm install

# 3. ก๊อปปี้โฟลเดอร์ prisma เข้าไป (ต้องทำก่อน generate)
COPY prisma ./prisma/

# 4. *** เพิ่มบรรทัดนี้ *** สั่ง Generate ข้างในนี้เลย
RUN npx prisma generate

# 5. ค่อยก๊อปปี้โค้ดส่วนที่เหลือ
COPY . .
RUN npm run build
# (คำสั่ง CMD หรือ ENTRYPOINT เดิมของคุณ)
CMD ["npm", "run", "start"]