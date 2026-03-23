const chapterName = "लंबाई एवं गति का मापन";
const className = "कक्षा 6 विज्ञान";
const chapterNumber = "अध्याय 5";

// ✅ SEO Title
document.title = `${chapterName} MCQ | ${className} ${chapterNumber} (50 प्रश्न)`;

// ✅ Meta Description
document.querySelector('meta[name="description"]').setAttribute(
  "content",
  `${className} के ${chapterNumber} ${chapterName} पर आधारित 50 महत्वपूर्ण MCQ प्रश्न उत्तर के साथ। परीक्षा की तैयारी के लिए बेहतरीन सामग्री।`
);

// ✅ Keywords
document.querySelector('meta[name="keywords"]').setAttribute(
  "content",
  `${chapterName} MCQ, ${className}, science mcq hindi, class 6 science`
);

// ✅ Open Graph
document.querySelector('meta[property="og:title"]').setAttribute(
  "content",
  `${chapterName} MCQ | ${className}`
);

document.querySelector('meta[property="og:description"]').setAttribute(
  "content",
  `${chapterName} के 50 महत्वपूर्ण MCQ प्रश्न उत्तर के साथ अभ्यास करें`
);

console.log(document.querySelector("meta[name='description']"));