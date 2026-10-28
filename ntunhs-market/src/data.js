// ============================================================
// MOCK DATA — 之後可替換為 Firebase Firestore 真實資料
// ============================================================

export const PRODUCTS = [
  { id:"1", image:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600", title:"護理學原理 第八版", price:350, category:"書籍", description:"九成新，無畫記，適合大一使用", date:"2天前", seller:"王小明", dept:"護理系" },
  { id:"2", image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", title:"MAC 口紅套組", price:800, category:"彩妝", description:"全新未拆封，朋友送的用不到", date:"3天前", seller:"林小芳", dept:"護理系" },
  { id:"3", image:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600", title:"Uniqlo 白色襯衫", price:200, category:"衣服", description:"M號，實習用只穿過3次", date:"1週前", seller:"張大明", dept:"資訊管理系" },
  { id:"4", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", title:"宿舍小電扇", price:150, category:"生活用品", description:"功能正常，搬家出清", date:"5天前", seller:"陳小美", dept:"高齡健康照護系" },
  { id:"5", image:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600", title:"解剖學講義", price:250, category:"書籍", description:"含筆記整理，八成新", date:"6天前", seller:"王小明", dept:"護理系" },
  { id:"6", image:"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", title:"開架彩妝組", price:300, category:"彩妝", description:"眼影盤、腮紅，9成新", date:"1週前", seller:"李小華", dept:"護理系" },
  { id:"7", image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600", title:"實習白褲", price:180, category:"衣服", description:"L號，洗過兩次，幾乎全新", date:"5天前", seller:"陳小美", dept:"高齡健康照護系" },
  { id:"8", image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", title:"桌上型檯燈", price:200, category:"生活用品", description:"LED護眼檯燈，宿舍用", date:"1週前", seller:"張大明", dept:"資訊管理系" },
];

export const JOBS = [
  { id:"j1", title:"徵咖啡廳工讀生", type:"校內工讀", location:"學生餐廳旁", salary:"時薪 NT$ 190", hours:"彈性排班", description:"校內咖啡廳徵工讀生，工作內容包含飲料製作、收銀、環境整理。", contact:"Line: cafe123", date:"1天前", poster:"學生餐廳" },
  { id:"j2", title:"圖書館助理", type:"校內工讀", location:"圖書館", salary:"時薪 NT$ 185", hours:"週一至週五 14:00-17:00", description:"協助圖書上架、整理、借還書作業。", contact:"Email: library@ntunhs.edu.tw", date:"2天前", poster:"圖書館" },
  { id:"j3", title:"家教老師（數學、英文）", type:"校外兼職", location:"北投區", salary:"時薪 NT$ 500-800", hours:"週末或平日晚上", description:"徵國中數學、英文家教老師，需有耐心，可長期配合。", contact:"手機：0912-345-678", date:"3天前", poster:"家長" },
  { id:"j4", title:"飲料店工讀生", type:"校外兼職", location:"石牌捷運站附近", salary:"時薪 NT$ 190", hours:"排班制，可配合課表", description:"手搖飲料店徵工讀生，需站立工作，會教學。", contact:"Line: drink2024", date:"4天前", poster:"飲料店" },
  { id:"j5", title:"實驗室助理", type:"實習機會", location:"護理系實驗室", salary:"月薪 NT$ 8,000", hours:"每週 10 小時", description:"協助教授進行研究，整理實驗數據，適合對研究有興趣的學生。", contact:"Email: prof.wang@ntunhs.edu.tw", date:"5天前", poster:"王教授" },
  { id:"j6", title:"便利商店大夜班", type:"校外兼職", location:"學校附近7-11", salary:"時薪 NT$ 220", hours:"23:00-07:00", description:"徵夜班工讀生，工作環境單純，適合夜貓子。", contact:"手機：0987-654-321", date:"1週前", poster:"便利商店" },
];

export const COURSES = [
  { id:"c1", title:"週三2-4換週五2-4", type:"必修課程", courseName:"解剖學", currentTime:"週三 13:10-15:00", desiredTime:"週五 13:10-15:00", reason:"週三有其他事情無法上課", contact:"Line: student123", date:"1天前", poster:"李小華", department:"護理系" },
  { id:"c2", title:"生理學換時段", type:"必修課程", courseName:"生理學", currentTime:"週一 10:10-12:00", desiredTime:"週二或週四同時段", reason:"想調整課表，配合打工時間", contact:"Email: student002@ntunhs.edu.tw", date:"2天前", poster:"張大明", department:"護理系" },
  { id:"c3", title:"週四選修課換週二", type:"選修課程", courseName:"健康促進", currentTime:"週四 15:10-17:00", desiredTime:"週二 15:10-17:00", reason:"週四需要實習，希望換到週二", contact:"手機：0912-345-678", date:"3天前", poster:"王小美", department:"健康事業管理系" },
  { id:"c4", title:"藥理學時段交換", type:"必修課程", courseName:"藥理學", currentTime:"週五 08:10-10:00", desiredTime:"週三 08:10-10:00", reason:"週五早上無法到校", contact:"Line: course2024", date:"4天前", poster:"陳小明", department:"護理系" },
  { id:"c5", title:"通識課程換時段", type:"選修課程", courseName:"音樂欣賞", currentTime:"週三 18:30-20:20", desiredTime:"週一或週二晚上", reason:"週三晚上有社團活動", contact:"Email: student005@ntunhs.edu.tw", date:"5天前", poster:"林小芳", department:"高齡健康照護系" },
];

export const CHATS_INIT = [
  { id:"1", name:"李小華", color:"#10B981", lastMessage:"好的，那我們約明天中午面交", time:"10:30", unread:2,
    messages:[
      {id:"m1", sender:"other", text:"你好，請問這本書還有嗎？", time:"10:15"},
      {id:"m2", sender:"me", text:"有的！九成新，無畫記", time:"10:18"},
      {id:"m3", sender:"other", text:"太好了！可以約面交嗎？", time:"10:25"},
      {id:"m4", sender:"me", text:"可以啊，明天中午12點在學生餐廳可以嗎？", time:"10:27"},
      {id:"m5", sender:"other", text:"好的，那我們約明天中午面交", time:"10:30"},
    ]
  },
  { id:"2", name:"張大明", color:"#8B5CF6", lastMessage:"這本書還在嗎？", time:"昨天", unread:0,
    messages:[
      {id:"m1", sender:"other", text:"這本書還在嗎？", time:"昨天"},
      {id:"m2", sender:"me", text:"還在喔！", time:"昨天"},
    ]
  },
  { id:"3", name:"陳小美", color:"#EC4899", lastMessage:"謝謝你！", time:"2天前", unread:0,
    messages:[
      {id:"m1", sender:"me", text:"那我們約週五交貨好嗎？", time:"2天前"},
      {id:"m2", sender:"other", text:"謝謝你！", time:"2天前"},
    ]
  },
];

export const GROUP_MSGS_INIT = [
  { id:"g1", sender:"李小華", color:"#10B981", text:"大家好！有人需要生理學課本嗎？", time:"09:15", isMe:false },
  { id:"g2", sender:"張大明", color:"#8B5CF6", text:"請問有人要換課嗎？我想把週三的課換成週五", time:"09:30", isMe:false },
  { id:"g3", sender:"我", color:"#0EA5E9", text:"我有一些二手衣服要賣，有興趣的可以私訊我～", time:"10:00", isMe:true },
  { id:"g4", sender:"陳小美", color:"#EC4899", text:"校內咖啡廳徵工讀生，有興趣的可以問我", time:"10:15", isMe:false },
  { id:"g5", sender:"王小明", color:"#F59E0B", text:"謝謝分享！", time:"10:20", isMe:false },
];
