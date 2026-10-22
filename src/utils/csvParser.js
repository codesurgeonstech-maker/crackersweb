/**
 * CSV Utility for parsing, generating templates and exports.
 */

/**
 * Parse CSV text into an array of row arrays, properly respecting quotes.
 */
export function parseCSV(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const result = [];

  for (const line of lines) {
    const row = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }

  return result;
}

/**
 * Parse products CSV with smart column mapping:
 * Supports: Name, Category/CategoryId, SellingPrice, OriginalPrice, Description, ImageUrl, StockQuantity, IsAvailable
 */
export function parseProductsCSV(csvText, defaultImageUrl = '') {
  const rows = parseCSV(csvText);
  if (rows.length === 0) return [];

  const cleanDefaultImg = (defaultImageUrl || '').trim();

  // Helper to test if a string looks like a valid image url / path
  const isLikelyImageUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim().toLowerCase();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/') || s.startsWith('data:image/')) {
      return true;
    }
    // Check if filename extension like .png, .jpg, .jpeg, .webp, .svg
    if (/\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(s)) {
      return true;
    }
    return false;
  };

  // Check if first row is a header
  let startIndex = 0;
  const firstRow = rows[0].map(c => c.toLowerCase());
  const hasHeader = firstRow.some(col =>
    col.includes('name') || col.includes('product') || col.includes('price') || col.includes('category')
  );

  let nameIdx = 0;
  let categoryIdx = hasHeader ? -1 : 1;
  let priceIdx = hasHeader ? -1 : 2;
  let originalPriceIdx = hasHeader ? -1 : 3;
  let descriptionIdx = hasHeader ? -1 : 4;
  let imageUrlIdx = hasHeader ? -1 : 5;
  let stockIdx = hasHeader ? -1 : 6;
  let availableIdx = hasHeader ? -1 : 7;

  if (hasHeader) {
    startIndex = 1;
    firstRow.forEach((col, idx) => {
      if (col.includes('name') || col.includes('product') || col.includes('title')) nameIdx = idx;
      else if (col.includes('cat')) categoryIdx = idx;
      else if (col.includes('orig') || col.includes('mrp') || col.includes('strike') || col.includes('regular')) originalPriceIdx = idx;
      else if (col.includes('price') || col.includes('rate') || col.includes('selling') || col.includes('cost')) priceIdx = idx;
      else if (col.includes('desc')) descriptionIdx = idx;
      else if (col.includes('image') || col.includes('img') || col.includes('photo') || col.includes('picture') || col.includes('url')) imageUrlIdx = idx;
      else if (col.includes('stock') || col.includes('qty') || col.includes('quantity')) stockIdx = idx;
      else if (col.includes('avail') || col.includes('active') || col.includes('status')) availableIdx = idx;
    });
  }

  const parsedProducts = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const name = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx].replace(/^["']|["']$/g, '').trim() : '';
    if (!name) continue;

    const rawPrice = (priceIdx !== -1 && row[priceIdx]) ? row[priceIdx].replace(/[^0-9.]/g, '') : '';
    const price = Number(rawPrice) || 0;

    const rawOrig = (originalPriceIdx !== -1 && row[originalPriceIdx]) ? row[originalPriceIdx].replace(/[^0-9.]/g, '') : '';
    const originalPrice = rawOrig ? Number(rawOrig) : null;

    const categoryRaw = (categoryIdx !== -1 && row[categoryIdx]) ? row[categoryIdx].replace(/^["']|["']$/g, '').trim() : '';
    const description = (descriptionIdx !== -1 && row[descriptionIdx]) ? row[descriptionIdx].replace(/^["']|["']$/g, '').trim() : 'Premium festive crackers';

    let rawImg = (imageUrlIdx !== -1 && row[imageUrlIdx]) ? row[imageUrlIdx].replace(/^["']|["']$/g, '').trim() : '';
    let imageUrl = '';

    // When defaultImageUrl is provided, omit all image URLs in the CSV and use this Default URL for all products
    if (cleanDefaultImg) {
      imageUrl = cleanDefaultImg;
    } else if (isLikelyImageUrl(rawImg)) {
      imageUrl = rawImg;
    }

    const rawStock = (stockIdx !== -1 && row[stockIdx]) ? row[stockIdx].replace(/[^0-9]/g, '') : '';
    const stockQuantity = rawStock ? Number(rawStock) : 100;

    const rawAvailable = (availableIdx !== -1 && row[availableIdx]) ? row[availableIdx].toLowerCase().trim() : 'yes';
    const isAvailable = rawAvailable !== 'no' && rawAvailable !== 'false' && rawAvailable !== '0' && rawAvailable !== 'sold out';

    parsedProducts.push({
      name,
      categoryRaw,
      price,
      originalPrice,
      description,
      imageUrl,
      stockQuantity,
      isAvailable
    });
  }

  return parsedProducts;
}

/**
 * Parse categories CSV:
 * Format: CategoryName, DisplayOrder
 */
export function parseCategoriesCSV(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length === 0) return [];

  let startIndex = 0;
  const firstRow = rows[0].map(c => c.toLowerCase());
  const hasHeader = firstRow.some(col => col.includes('name') || col.includes('category') || col.includes('order'));

  let nameIdx = 0;
  let orderIdx = 1;

  if (hasHeader) {
    startIndex = 1;
    firstRow.forEach((col, idx) => {
      if (col.includes('name') || col.includes('category') || col.includes('title')) nameIdx = idx;
      else if (col.includes('order') || col.includes('seq') || col.includes('priority')) orderIdx = idx;
    });
  }

  const parsedCategories = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameIdx] ? row[nameIdx].replace(/^["']|["']$/g, '').trim() : '';
    if (!name) continue;

    const rawOrder = row[orderIdx] ? row[orderIdx].replace(/[^0-9]/g, '') : '';
    const displayOrder = rawOrder ? Number(rawOrder) : (parsedCategories.length + 1);

    parsedCategories.push({
      name,
      displayOrder
    });
  }

  return parsedCategories;
}

/**
 * Generate Sample Products CSV content
 */
export function getSampleProductsCSV() {
  return `Product Name,Category,Selling Price,MRP / Original Price,Description,Image URL,Stock Quantity,Is Available
"10 cm Electric Sparklers","Sparklers",65,120,"Crackling golden sparks, 10 pcs pack safe for family celebration","https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80",200,Yes
"Mega 1000 Wala Garland","Garland Crackers",750,1400,"Traditional celebratory red ribbon roll with thunderous sounds","https://images.unsplash.com/photo-1576400883215-7083980b6197?w=500&auto=format&fit=crop&q=80",50,Yes
"Special Flower Pots Ashoka","Flower Pots",140,260,"Fountain of sparkling silver and gold showers, 10 pcs box","https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80",120,Yes
"Ground Chakkar Deluxe","Chakkars",90,160,"High-speed spinning wheel with vibrant green and red sparks","https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80",150,Yes
"12 Shot Sky Symphony","Aerial Shots",320,600,"Multi-colour aerial bursts with whistling sound and brocade crown","https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=500&auto=format&fit=crop&q=80",80,Yes`;
}

/**
 * Generate Sample Categories CSV content
 */
export function getSampleCategoriesCSV() {
  return `Category Name,Display Order
"Sparklers",1
"Flower Pots",2
"Ground Chakkars",3
"Garland Crackers",4
"Sound Crackers",5
"Aerial Shots & Cakes",6
"Novelty & Kids Special",7
"Gift Boxes",8`;
}
