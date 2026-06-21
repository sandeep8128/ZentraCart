// // ===================================================================
// // FILE: src/utils/parseProductDescription.js
// // ===================================================================
// //
// // YEH FILE KYU BANAYI?
// // Hamara backend product ka description ek hi LAMBI STRING mein bhejta
// // hai. Usme "About" wala text + "Key Features" + "Specifications" sab
// // EK SAATH chipka hua aata hai. Agar hum isay seedha <p> tag mein daal
// // dete hain to sab kuch ek hi paragraph ban jaata hai (jaisa pehle ho
// // raha tha) — bullets nahi dikhte, table nahi dikhti.
// //
// // IS FUNCTION KA KAAM:
// // Description string ko AANDAR SE PADHKAR teen alag-alag parts mein
// // todna:
// //   1) aboutText -> normal paragraph wala text
// //   2) features  -> array of strings (✔ Premium Cotton, ✔ Slim Fit, ...)
// //   3) specs     -> object of key-value pairs (Brand: Allen Solly, ...)
// //
// // YEH FUNCTION HAR PRODUCT PE CHALEGA, sirf ek product ke liye nahi —
// // kyuki yeh "raw" parameter se text leta hai, jo har baar product ka
// // asli description hoga.
// //
// // SAFETY: Agar kisi product ka description bilkul plain hai (seller ne
// // koi "Key Features" / "Specifications" likha hi nahi), to yeh function
// // CRASH nahi karega — pura text wapas "aboutText" mein chala jaayega,
// // matlab woh sirf ek simple paragraph ki tarah dikhega. features[] aur
// // specs{} khali reh jayenge, aur UI mein hum unko sirf tabhi dikhayenge
// // jab unme kuch ho.
// // ===================================================================


// // "export" likhne se yeh function doosri files (jaise ProductDetails.jsx)
// // mein "import { parseProductDescription } from ..." karke use ho sakta hai
// export function parseProductDescription(raw) {

//   // -----------------------------------------------------------------
//   // STEP 0: SAFETY CHECK
//   // -----------------------------------------------------------------
//   // Agar "raw" khali hai (undefined/null/empty string) ya string nahi
//   // hai (kabhi kabhi backend galti se number/object bhi bhej sakta hai)
//   // to seedha khali values return kar do. Isse app crash nahi karegi.
//   if (!raw || typeof raw !== "string") {
//     return { aboutText: "", features: [], specs: {} };
//   }

//   // raw string ke shuru/end ke extra spaces hata do
//   let text = raw.trim();


//   // -----------------------------------------------------------------
//   // STEP 1: "KEY FEATURES" SECTION DHOONDO
//   // -----------------------------------------------------------------
//   // Seller "⭐ Key Features" likh sakta hai, ya sirf "Key Features",
//   // ya "key features:" (chote letters mein). Hum REGEX use kar rahe
//   // hain taaki yeh sab variations match ho jaayein.
//   //
//   // Regex explanation:
//   //   (?:⭐\s*)?   -> star emoji ho ya na ho, dono chalega (optional)
//   //   key features -> yeh exact words dhoondo
//   //   \s*:?        -> end mein colon ho ya na ho, dono chalega
//   //   /i           -> case-insensitive (KEY FEATURES, Key Features sab match)

//   let aboutText = text;       // default: agar kuch na mile to pura text "about" maan lo
//   let featuresText = "";      // features wala raw chunk yahan store hoga
//   let afterFeatures = "";     // "Key Features" ke baad ka bacha hua text

//   const featuresMatch = text.match(/(?:⭐\s*)?key features\s*:?/i);

//   if (featuresMatch) {
//     // featuresMatch.index = jahan se "Key Features" word shuru hota hai
//     const idx = featuresMatch.index;

//     // "Key Features" se PEHLE wala text = About section
//     aboutText = text.slice(0, idx).trim();

//     // "Key Features" ke BAAD wala text = abhi ke liye temporarily store karo
//     // (isme features bhi honge aur shayad specifications bhi)
//     afterFeatures = text.slice(idx + featuresMatch[0].length);
//   }


//   // -----------------------------------------------------------------
//   // STEP 2: "SPECIFICATIONS" SECTION DHOONDO
//   // -----------------------------------------------------------------
//   // Yeh "📊 Product Specifications" ya sirf "Specifications" ho sakta hai.
//   // Hum ise us text mein dhoondte hain jo Step 1 ke baad bacha tha
//   // (afterFeatures). Agar "Key Features" mila hi nahi tha to poore
//   // original text mein dhoondo.

//   let specsText = "";
//   const sourceForSpecs = afterFeatures || text;

//   const specsMatch = sourceForSpecs.match(
//     /(?:📊\s*)?(?:product\s*)?specifications?\s*:?/i
//   );

//   if (specsMatch) {
//     const idx = specsMatch.index;

//     // "Specifications" se PEHLE wala text = asli Features list
//     featuresText = sourceForSpecs.slice(0, idx);

//     // "Specifications" ke BAAD wala text = Specs ka data
//     specsText = sourceForSpecs.slice(idx + specsMatch[0].length);
//   } else {
//     // Specifications mila hi nahi -> jo bhi bacha tha sab features mein chala jaaye
//     featuresText = sourceForSpecs;
//   }

//   // -----------------------------------------------------------------
//   // Edge case fix: agar "Key Features" bilkul nahi mila tha (Step 1 mein),
//   // lekin "Specifications" mil gaya, to specs ko seedha original text se
//   // nikaalna padega (kyuki tab featuresText galat ban gaya hoga)
//   // -----------------------------------------------------------------
//   if (!featuresMatch) {
//     featuresText = "";

//     if (specsMatch) {
//       const idx = specsMatch.index;
//       aboutText = text.slice(0, idx).trim();
//       specsText = text.slice(idx + specsMatch[0].length);
//     }
//   }


//   // -----------------------------------------------------------------
//   // STEP 3: FEATURES KO BULLET LIST MEIN TODO
//   // -----------------------------------------------------------------
//   // Seller alag-alag symbols use kar sakta hai bullets ke liye:
//   // "✔", "•", "-", "*". Hum sab ko ek saath regex se split karte hain.
//   //
//   // /✔|•|(?:^|\s)-\s|\*/g  matlab:
//   //   ✔  -> tick symbol se todo
//   //   •  -> bullet dot se todo
//   //   (?:^|\s)-\s -> "- " (dash+space) se todo, lekin sirf jab woh
//   //                  line ke start mein ho ya pehle space ho
//   //                  (taaki normal hyphenated words na toot jaayein,
//   //                  jaise "Slim-Fit" ko galti se na tod de)
//   //   \*  -> star symbol se todo

//   let features = [];

//   if (featuresText.trim()) {
//     const bulletSplit = featuresText.split(/✔|•|(?:^|\s)-\s|\*/g);

//     // split karne ke baad har piece ke extra spaces hatao aur
//     // khali pieces ko hata do
//     features = bulletSplit.map((f) => f.trim()).filter((f) => f.length > 0);

//     // -----------------------------------------------------------
//     // SAFETY CHECK: agar split karne ke baad sirf EK hi piece bacha
//     // (matlab koi bullet symbol mila hi nahi tha asal mein), to yeh
//     // structured list nahi hai — yeh sirf normal sentence tha.
//     // Is case mein isay wapas "aboutText" mein jod do, taaki text
//     // gum na ho aur UI mein ek hi point wali "list" na dikhe.
//     // -----------------------------------------------------------
//     if (features.length <= 1) {
//       aboutText = `${aboutText} ${featuresText}`.trim();
//       features = []; // features khali rakho, UI mein list section hide ho jayega
//     }
//   }


//   // -----------------------------------------------------------------
//   // STEP 4: SPECIFICATIONS KO KEY-VALUE PAIRS (OBJECT) MEIN TODO
//   // -----------------------------------------------------------------
//   // Do tarah ke formats handle karte hain:
//   //
//   //  FORMAT A (Pipe/table style):
//   //    "| Feature | Details | | Brand | Allen Solly | | Fabric | Cotton |"
//   //
//   //  FORMAT B (Colon/line style):
//   //    "Brand: Allen Solly
//   //     Fabric: Cotton"

//   let specs = {};

//   if (specsText.trim()) {

//     if (specsText.includes("|")) {
//       // ---------- FORMAT A: Pipe-separated table ----------

//       // "|" pe split karo, fir har piece ko trim karo
//       const tokens = specsText
//         .split("|")
//         .map((s) => s.trim())
//         // khali pieces aur sirf dashes wale pieces hatao (jaise "------")
//         .filter((s) => s.length > 0 && !/^-+$/.test(s))
//         // table ka header row ("Feature", "Details" words) bhi hata do
//         .filter((s) => !/^(feature|details)$/i.test(s));

//       // ab tokens kuch is tarah ki flat list hai:
//       // ["Brand", "Allen Solly", "Fabric", "100% Cotton", ...]
//       // Hum do-do tokens uthakar key:value pair banate hain (i += 2)
//       for (let i = 0; i < tokens.length - 1; i += 2) {
//         const key = tokens[i];
//         const value = tokens[i + 1];
//         if (key && value) {
//           specs[key] = value;
//         }
//       }

//     } else {
//       // ---------- FORMAT B: Colon ya comma separated lines ----------

//       // Newline se todo, YA comma ke baad agar capital letter aaye
//       // (taaki "Brand: Nike, Color: Black" jaisी single-line bhi todi ja sake)
//       const lines = specsText
//         .split(/\n|,(?=\s*[A-Z])/)
//         .map((s) => s.trim())
//         .filter(Boolean);

//       lines.forEach((line) => {
//         // Regex: "KeyName: Value" pattern dhoondo
//         // ([^:]{2,30}) -> key 2 se 30 characters ka ho, colon na ho usme
//         // :\s*          -> colon ke baad space ho ya na ho
//         // (.+)          -> baaki sab value hai
//         const match = line.match(/^([^:]{2,30}):\s*(.+)$/);
//         if (match) {
//           specs[match[1].trim()] = match[2].trim();
//         }
//       });
//     }

//     // -----------------------------------------------------------
//     // SAFETY CHECK: agar dono formats try karne ke baad bhi koi
//     // valid pair nahi bana (specs object khali hai), to iska matlab
//     // yeh structured specs data nahi tha. Isay plain text maankar
//     // wapas aboutText mein daal do — taaki seller ka likha hua text
//     // GUM na ho, sirf table na bane.
//     // -----------------------------------------------------------
//     if (Object.keys(specs).length === 0) {
//       aboutText = `${aboutText} ${specsText}`.trim();
//     }
//   }


//   // -----------------------------------------------------------------
//   // STEP 5: FINAL CLEANUP
//   // -----------------------------------------------------------------
//   // Multiple spaces ko ek space mein convert karo (jaise "hello   world"
//   // -> "hello world"), taaki UI mein extra gaps na dikhein
//   aboutText = aboutText.replace(/\s+/g, " ").trim();


//   // -----------------------------------------------------------------
//   // STEP 6: TEEN PARTS WAPAS BHEJO
//   // -----------------------------------------------------------------
//   // Jo bhi component (ProductDetails.jsx) isay call karega, usko
//   // yeh teeno cheezein object ke roop mein milengi:
//   //   { aboutText, features, specs }
//   return { aboutText, features, specs };
// }