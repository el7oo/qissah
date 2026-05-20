const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'orlcqc8n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-19',
  token: 'skazU0Rsj3mjdHt3iEtKNIhdnxA7HCr4KCbhEM8wUKuGVi2O3oNQKMNPGJ28aDAKLvEyMgKlVKb6DJD1srECtZ8op2HdpdxRT0efEZ8oZ9hjKMEGKr9opFeqAGmLdOVIks57fTb56EI24vEA29nBST72wu7px1z331qLryhH6U1RptarAGKi'
});

const ratesText = `
#1 - Adrar: المنزل 900 DA | المكتب 800 DA
#2 - Chlef: المنزل 600 DA | المكتب 500 DA
#3 - Laghouat: المنزل 800 DA | المكتب 700 DA
#4 - Oum El Bouaghi: المنزل 600 DA | المكتب 500 DA
#5 - Batna: المنزل 600 DA | المكتب 500 DA
#6 - Béjaïa: المنزل 600 DA | المكتب 500 DA
#7 - Biskra: المنزل 800 DA | المكتب 700 DA
#8 - Béchar: المنزل 800 DA | المكتب 700 DA
#9 - Blida: المنزل 800 DA | المكتب 400 DA
#10 - Bouira: المنزل 600 DA | المكتب 500 DA
#11 - Tamanghasset: المنزل 900 DA | المكتب 800 DA
#12 - Tébessa: المنزل 600 DA | المكتب 500 DA
#13 - Tlemcen: المنزل 600 DA | المكتب 500 DA
#14 - Tiaret: المنزل 700 DA | المكتب 600 DA
#15 - Tizi Ouzou: المنزل 600 DA | المكتب 500 DA
#16 - Alger: المنزل 300 DA | المكتب 0 DA
#17 - Djelfa: المنزل 700 DA | المكتب 600 DA
#18 - Jijel: المنزل 600 DA | المكتب 500 DA
#19 - Sétif: المنزل 600 DA | المكتب 500 DA
#20 - Saïda: المنزل 800 DA | المكتب 700 DA
#21 - Skikda: المنزل 600 DA | المكتب 500 DA
#22 - Sidi Bel Abbès: المنزل 700 DA | المكتب 600 DA
#23 - Annaba: المنزل 600 DA | المكتب 500 DA
#24 - Guelma: المنزل 700 DA | المكتب 600 DA
#25 - Constantine: المنزل 600 DA | المكتب 500 DA
#26 - Médéa: المنزل 600 DA | المكتب غير مذكور
#27 - Mostaganem: المنزل 600 DA | المكتب 500 DA
#28 - M'Sila: المنزل 600 DA | المكتب 500 DA
#29 - Mascara: المنزل 700 DA | المكتب 600 DA
#30 - Ouargla: المنزل 800 DA | المكتب 700 DA
#31 - Oran: المنزل 600 DA | المكتب 500 DA
#32 - El Bayadh: المنزل 900 DA | المكتب 800 DA
#33 - Illizi: المنزل 900 DA | المكتب 800 DA
#34 - Bordj Bou Arréridj: المنزل 600 DA | المكتب 500 DA
#35 - Boumerdès: المنزل 800 DA | المكتب 500 DA
#36 - El Tarf: المنزل 700 DA | المكتب 600 DA
#37 - Tindouf: المنزل 900 DA | المكتب 800 DA
#38 - Tissemsilt: المنزل 600 DA | المكتب 500 DA
#39 - El Oued: المنزل 800 DA | المكتب 700 DA
#40 - Khenchela: المنزل 700 DA | المكتب 600 DA
#41 - Souk Ahras: المنزل 700 DA | المكتب 600 DA
#42 - Tipasa: المنزل 800 DA | المكتب 400 DA
#43 - Mila: المنزل 600 DA | المكتب 500 DA
#44 - Aïn Defla: المنزل 600 DA | المكتب 500 DA
#45 - Naâma: المنزل 800 DA | المكتب 700 DA
#46 - Aïn Témouchent: المنزل 600 DA | المكتب 500 DA
#47 - Ghardaïa: المنزل 800 DA | المكتب 700 DA
#48 - Relizane: المنزل 600 DA | المكتب 500 DA
#49 - Timimoun: المنزل 900 DA | المكتب 800 DA
#50 - Bordj Badji Mokhtar: المنزل 600 DA | المكتب 500 DA
#51 - Ouled Djellal: المنزل 800 DA | المكتب 700 DA
#52 - Béni Abbès: المنزل 800 DA | المكتب 700 DA
#53 - In Salah: المنزل 900 DA | المكتب 800 DA
#54 - In Guezzam: المنزل 900 DA | المكتب 800 DA
#55 - Touggourt: المنزل 900 DA | المكتب 800 DA
#56 - Djanet: المنزل 900 DA | المكتب 800 DA
#57 - El Meghaier: المنزل 900 DA | المكتب 800 DA
#58 - El Menia: المنزل 900 DA | المكتب غير مذكور
`;

async function createVibe2() {
  console.log('🔄 جاري إنشاء ملف الشحن vibe 2...');
  
  const lines = ratesText.trim().split('\n');
  const rates = lines.map(line => {
    // line: "#1 - Adrar: المنزل 900 DA | المكتب 800 DA"
    const match = line.match(/#(\d+)\s*-\s*([^:]+):\s*المنزل\s*(\d+)\s*DA\s*\|\s*المكتب\s*(غير مذكور|\d+)/);
    if (!match) return null;
    
    const id = parseInt(match[1]);
    const name = match[2].trim();
    const homePrice = parseInt(match[3]);
    let deskPrice = homePrice; // default if not mentioned
    if (match[4] !== 'غير مذكور') {
      deskPrice = parseInt(match[4]);
    }
    
    return {
      _key: Math.random().toString(36).substring(7),
      wilayaId: id,
      wilayaName: name,
      homePrice: homePrice,
      deskPrice: deskPrice
    };
  }).filter(Boolean);
  
  const newProfile = {
    _type: 'shippingProfile',
    title: 'vibe 2',
    rates: rates
  };
  
  try {
    const created = await client.create(newProfile);
    console.log('✅ تم إنشاء ملف الشحن بنجاح برقم تعريف:', created._id);
  } catch (e) {
    console.error('❌ خطأ:', e.message);
  }
}

createVibe2();
