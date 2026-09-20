import { jsPDF } from 'jspdf';
import { GeneratedItinerary, ItineraryActivity, ItineraryDay } from '../types';

// Color Palette Definition for Clean, Modern Editorial PDF Design
const C = {
  // Brand & Accents
  navyDark: [15, 23, 42] as [number, number, number],        // #0f172a Slate 900
  indigoDeep: [49, 46, 129] as [number, number, number],     // #312e81 Indigo 900
  indigoPrimary: [79, 70, 229] as [number, number, number],  // #4f46e5 Indigo 600
  indigoLight: [238, 242, 255] as [number, number, number],  // #eef2ff Indigo 50
  indigoBorder: [199, 210, 254] as [number, number, number], // #c7d2fe Indigo 200

  // Text Colors
  textDark: [15, 23, 42] as [number, number, number],        // #0f172a Slate 900
  textPrimary: [30, 41, 59] as [number, number, number],    // #1e293b Slate 800
  textBody: [51, 65, 85] as [number, number, number],        // #334155 Slate 700
  textSecondary: [71, 85, 105] as [number, number, number],  // #475569 Slate 600
  textMuted: [100, 116, 139] as [number, number, number],    // #64748b Slate 500
  textLight: [148, 163, 184] as [number, number, number],    // #94a3b8 Slate 400
  textWhite: [255, 255, 255] as [number, number, number],

  // Backgrounds & Cards
  bgCard: [248, 250, 252] as [number, number, number],       // #f8fafc Slate 50
  bgCardAlt: [241, 245, 249] as [number, number, number],    // #f1f5f9 Slate 100
  borderLight: [226, 232, 240] as [number, number, number],  // #e2e8f0 Slate 200
  borderDark: [203, 213, 225] as [number, number, number],   // #cbd5e1 Slate 300

  // Emerald (Cost & Value)
  emerald: [5, 150, 105] as [number, number, number],        // #059669 Emerald 600
  emeraldBg: [236, 253, 245] as [number, number, number],    // #ecfdf5 Emerald 50
  emeraldBorder: [167, 243, 208] as [number, number, number],// #a7f3d0 Emerald 200

  // Amber (Local Tips & Warm Highlights)
  amber: [180, 83, 9] as [number, number, number],           // #b45309 Amber 700
  amberText: [146, 64, 14] as [number, number, number],      // #92400e Amber 800
  amberBg: [254, 243, 199] as [number, number, number],      // #fef3c7 Amber 50
  amberBorder: [253, 230, 138] as [number, number, number],  // #fde68a Amber 200

  // Sky Blue (Afternoon & Transit)
  sky: [2, 132, 199] as [number, number, number],            // #0284c7 Sky 600
  skyBg: [240, 249, 255] as [number, number, number],        // #f0f9ff Sky 50

  // Purple / Violet (Evening / Night)
  violet: [109, 40, 217] as [number, number, number],        // #6d28d9 Violet 700
  violetBg: [245, 243, 255] as [number, number, number],     // #f5f3ff Violet 50
};

// Slot Accent Helper for Time of Day
function getTimeSlotPalette(slot: string = '') {
  const s = slot.toLowerCase();
  if (s.includes('morning') || s.includes('dawn')) {
    return {
      stripe: [245, 158, 11] as [number, number, number], // Amber 500
      tagText: C.amberText,
      tagBg: C.amberBg,
    };
  }
  if (s.includes('afternoon') || s.includes('noon')) {
    return {
      stripe: [2, 132, 199] as [number, number, number],  // Sky 600
      tagText: [3, 105, 161] as [number, number, number], // Sky 700
      tagBg: C.skyBg,
    };
  }
  if (s.includes('evening') || s.includes('sunset')) {
    return {
      stripe: [79, 70, 229] as [number, number, number],  // Indigo 600
      tagText: [67, 56, 202] as [number, number, number], // Indigo 700
      tagBg: C.indigoLight,
    };
  }
  // Night or Default
  return {
    stripe: [109, 40, 217] as [number, number, number],  // Violet 700
    tagText: [91, 33, 182] as [number, number, number],  // Violet 800
    tagBg: C.violetBg,
  };
}

export function exportItineraryToPDF(itinerary: GeneratedItinerary) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;                                    // 14 mm left & right
  const contentWidth = pageWidth - margin * 2;          // 182 mm
  const bottomThreshold = pageHeight - 16;              // 16 mm from bottom for footer

  let yPos = 0;

  // Safe Fallback Field Extraction
  const city = itinerary.city || 'Destination';
  const country = itinerary.country || '';
  const totalDays = itinerary.totalDays || (itinerary.days ? itinerary.days.length : 1);
  const travelStyle = itinerary.travelStyle || 'Balanced Exploration';
  const budgetTier = itinerary.budgetTier || 'Standard';
  const totalBudget = itinerary.totalEstimatedBudget || 'Flexible';
  const createdAt = itinerary.createdAt || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Page Space Guardian
  const ensureSpace = (requiredHeight: number): boolean => {
    if (yPos + requiredHeight > bottomThreshold) {
      doc.addPage();
      yPos = 24; // Start below running header on pages 2+
      return true;
    }
    return false;
  };

  // ----------------------------------------------------
  // 1. PAGE 1: HEADER BANNER (Editorial Cover Style)
  // ----------------------------------------------------
  const bannerHeight = 44;
  doc.setFillColor(...C.navyDark);
  doc.rect(0, 0, pageWidth, bannerHeight, 'F');

  // Decorative Accent Bar below Banner
  doc.setFillColor(...C.indigoPrimary);
  doc.rect(0, bannerHeight - 1.5, pageWidth, 1.5, 'F');

  // Brand Name
  doc.setTextColor(...C.textWhite);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPLORA AI', margin, 17);

  // Subtitle / Tagline
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.indigoBorder);
  doc.text('Smart Travel Companion & Curated Day-by-Day Itinerary', margin, 24);

  // Metadata Timestamp line
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textLight);
  doc.text(`Generated on: ${createdAt}   •   Official Smart Itinerary Document`, margin, 31);

  // Top-Right Destination Badge Card
  const badgeTitle = city.toUpperCase();
  const badgeSubtitle = `${totalDays} ${totalDays === 1 ? 'DAY' : 'DAYS'} • ${budgetTier.toUpperCase()}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const titleWidth = doc.getTextWidth(badgeTitle);
  doc.setFontSize(7.5);
  const subWidth = doc.getTextWidth(badgeSubtitle);
  const badgeWidth = Math.max(56, Math.max(titleWidth, subWidth) + 16);
  const badgeX = pageWidth - margin - badgeWidth;

  doc.setFillColor(...C.indigoDeep);
  doc.setDrawColor(...C.indigoPrimary);
  doc.setLineWidth(0.4);
  doc.roundedRect(badgeX, 10, badgeWidth, 24, 3, 3, 'FD');

  doc.setTextColor(...C.textWhite);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(badgeTitle, badgeX + badgeWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.indigoBorder);
  doc.text(badgeSubtitle, badgeX + badgeWidth / 2, 27, { align: 'center' });

  yPos = bannerHeight + 7;

  // ----------------------------------------------------
  // 2. TRIP OVERVIEW CARD & METRICS
  // ----------------------------------------------------
  const overviewCardY = yPos;
  const overviewCardHeight = 32;

  doc.setFillColor(...C.bgCard);
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, overviewCardY, contentWidth, overviewCardHeight, 3, 3, 'FD');

  // Left Accent Pillar
  doc.setFillColor(...C.indigoPrimary);
  doc.roundedRect(margin, overviewCardY, 3, overviewCardHeight, 1.5, 1.5, 'F');

  // 4 Evenly Spaced Columns
  const colCount = 4;
  const colWidth = (contentWidth - 10) / colCount;
  const metrics = [
    { label: 'DESTINATION', value: country ? `${city}, ${country}` : city },
    { label: 'DURATION & STYLE', value: `${totalDays} Days • ${travelStyle}` },
    { label: 'TARGET BUDGET', value: totalBudget },
    { label: 'BUDGET TIER', value: budgetTier },
  ];

  metrics.forEach((m, idx) => {
    const colX = margin + 6 + idx * colWidth;
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textMuted);
    doc.text(m.label, colX, overviewCardY + 7);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.textDark);
    const splitVal = doc.splitTextToSize(m.value, colWidth - 4);
    doc.text(splitVal, colX, overviewCardY + 13);
  });

  // Budget Breakdown Sub-row
  const breakdownY = overviewCardY + 22;
  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.2);
  doc.line(margin + 5, breakdownY - 2, margin + contentWidth - 5, breakdownY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textMuted);
  doc.text('ALLOCATION BREAKDOWN:', margin + 6, breakdownY + 3.5);

  const bb = itinerary.budgetBreakdown || { stay: 35, food: 25, sightseeing: 25, transit: 15, buffer: 0 };
  const allocItems = [
    { name: 'Stay', pct: bb.stay || 35 },
    { name: 'Food', pct: bb.food || 25 },
    { name: 'Sightseeing', pct: bb.sightseeing || 25 },
    { name: 'Transit', pct: bb.transit || 15 },
  ];
  if (bb.buffer && bb.buffer > 0) {
    allocItems.push({ name: 'Buffer', pct: bb.buffer });
  }

  let allocX = margin + 46;
  allocItems.forEach((item) => {
    const pillText = `${item.name} ~${item.pct}%`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const pillW = doc.getTextWidth(pillText) + 5;

    doc.setFillColor(...C.bgCardAlt);
    doc.roundedRect(allocX, breakdownY, pillW, 5.5, 1.5, 1.5, 'F');

    doc.setTextColor(...C.textBody);
    doc.text(pillText, allocX + 2.5, breakdownY + 3.8);
    allocX += pillW + 3;
  });

  yPos = overviewCardY + overviewCardHeight + 8;

  // ----------------------------------------------------
  // 3. DAY-BY-DAY ITINERARY SECTIONS
  // ----------------------------------------------------
  const daysList: ItineraryDay[] = itinerary.days && itinerary.days.length > 0 ? itinerary.days : [];

  daysList.forEach((day, dIdx) => {
    // Check if day header fits
    ensureSpace(34);

    // DAY HEADER CONTAINER
    const dayHeaderY = yPos;
    const dayBadgeText = `DAY ${day.dayNumber || dIdx + 1}`;
    
    // Day Title Text Wrapping
    const dayTitleText = day.title || `Day ${day.dayNumber || dIdx + 1}: Exploration & Highlights`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const dayTitleLines = doc.splitTextToSize(dayTitleText, contentWidth - 32);
    const headerHeight = Math.max(16, 11 + dayTitleLines.length * 4.5);

    // Day Header Background Box
    doc.setFillColor(...C.bgCardAlt);
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, dayHeaderY, contentWidth, headerHeight, 2.5, 2.5, 'FD');

    // Day Badge (Solid Indigo Pill)
    doc.setFillColor(...C.indigoPrimary);
    doc.roundedRect(margin + 3.5, dayHeaderY + 3.5, 18, 7.5, 2, 2, 'F');
    doc.setTextColor(...C.textWhite);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(dayBadgeText, margin + 12.5, dayHeaderY + 8.5, { align: 'center' });

    // Day Title
    doc.setTextColor(...C.textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(dayTitleLines, margin + 25, dayHeaderY + 8.5);

    // Day Sub-bar: Theme & Estimated Cost
    const subBarY = dayHeaderY + 9 + dayTitleLines.length * 4.5;
    let currentSubX = margin + 5;

    if (day.totalDayEstimatedCost) {
      const costText = `Est. Day Cost: ${day.totalDayEstimatedCost}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      const costW = doc.getTextWidth(costText) + 5;
      doc.setFillColor(...C.emeraldBg);
      doc.setDrawColor(...C.emeraldBorder);
      doc.setLineWidth(0.2);
      doc.roundedRect(currentSubX, subBarY, costW, 5, 1.2, 1.2, 'FD');
      doc.setTextColor(...C.emerald);
      doc.text(costText, currentSubX + 2.5, subBarY + 3.5);
      currentSubX += costW + 3;
    }

    if (day.foodSpecialty) {
      const foodText = `Culinary Highlight: ${day.foodSpecialty}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const foodLines = doc.splitTextToSize(foodText, contentWidth - (currentSubX - margin) - 4);
      doc.setTextColor(...C.textMuted);
      doc.text(foodLines[0] || '', currentSubX + 2, subBarY + 3.5);
    }

    yPos = dayHeaderY + headerHeight + 5;

    // ACTIVITIES IN THIS DAY
    const activities: ItineraryActivity[] = day.activities && day.activities.length > 0 ? day.activities : [];

    activities.forEach((act) => {
      // Calculate dynamic text lines and height
      const palette = getTimeSlotPalette(act.timeSlot);
      const innerWidth = contentWidth - 14;

      // 1. Description Lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      const descLines = act.description ? doc.splitTextToSize(act.description, innerWidth) : [];
      const descHeight = descLines.length * 3.8;

      // 2. Tip Lines
      let tipLines: string[] = [];
      let tipBoxHeight = 0;
      if (act.localTip && act.localTip.trim().length > 0) {
        doc.setFontSize(7.5);
        tipLines = doc.splitTextToSize(`Insider Tip: ${act.localTip}`, innerWidth - 8);
        tipBoxHeight = Math.max(7, tipLines.length * 3.5 + 4);
      }

      // 3. Total Card Height
      // Header row: 8mm | Desc: descHeight | Tip: tipBoxHeight | Meta row: 6.5mm | Margins: 6mm
      const cardHeight = Math.max(22, 10 + descHeight + (tipBoxHeight > 0 ? tipBoxHeight + 2 : 0) + 7);

      // Check space
      ensureSpace(cardHeight + 4);

      const cardY = yPos;

      // Card Container
      doc.setFillColor(...C.bgCard);
      doc.setDrawColor(...C.borderLight);
      doc.setLineWidth(0.25);
      doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, 'FD');

      // Left Time-of-Day Colored Indicator Stripe
      doc.setFillColor(...palette.stripe);
      doc.roundedRect(margin, cardY, 2.5, cardHeight, 1.2, 1.2, 'F');

      // Time Slot Pill (e.g., Morning • 08:30 AM)
      const slotString = `${act.timeSlot || 'Activity'} • ${act.time || ''}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      const slotW = doc.getTextWidth(slotString) + 5;

      doc.setFillColor(...palette.tagBg);
      doc.roundedRect(margin + 5, cardY + 3, slotW, 5, 1.2, 1.2, 'F');
      doc.setTextColor(...palette.tagText);
      doc.text(slotString, margin + 7.5, cardY + 6.5);

      // Place Name & Category
      const placeX = margin + 7 + slotW + 2;
      const maxPlaceW = contentWidth - (placeX - margin) - 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...C.textDark);
      const placeText = act.category ? `${act.placeName} ` : act.placeName;
      const placeLines = doc.splitTextToSize(placeText, maxPlaceW);
      doc.text(placeLines[0], placeX, cardY + 6.7);

      let textCursorY = cardY + 11.5;

      // Description Text
      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(...C.textBody);
        doc.text(descLines, margin + 6, textCursorY);
        textCursorY += descHeight + 1.5;
      }

      // Local Insider Tip Box
      if (tipBoxHeight > 0 && tipLines.length > 0) {
        doc.setFillColor(...C.amberBg);
        doc.setDrawColor(...C.amberBorder);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin + 6, textCursorY, innerWidth + 2, tipBoxHeight, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...C.amberText);
        doc.text(tipLines, margin + 9, textCursorY + 3.6);
        textCursorY += tipBoxHeight + 2;
      }

      // Footer Meta: Cost, Duration & Transport
      const metaY = cardY + cardHeight - 3.2;
      let metaX = margin + 6;

      // Cost Tag
      if (act.estimatedCost) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(...C.emerald);
        doc.text(`Cost: ${act.estimatedCost}`, metaX, metaY);
        metaX += doc.getTextWidth(`Cost: ${act.estimatedCost}`) + 6;
      }

      // Duration Tag
      if (act.duration) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...C.textMuted);
        doc.text(`Duration: ${act.duration}`, metaX, metaY);
        metaX += doc.getTextWidth(`Duration: ${act.duration}`) + 6;
      }

      // Transit Tag
      if (act.transportRecommendation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...C.textSecondary);
        const transitText = `Transit: ${act.transportRecommendation}`;
        const maxTransitW = contentWidth - (metaX - margin) - 4;
        const splitTransit = doc.splitTextToSize(transitText, maxTransitW);
        doc.text(splitTransit[0] || '', metaX, metaY);
      }

      yPos = cardY + cardHeight + 3.5;
    });

    yPos += 3;
  });

  // ----------------------------------------------------
  // 4. PACKING TIPS & SAFETY ADVISORY SECTION
  // ----------------------------------------------------
  const packingTips = itinerary.packingTips && itinerary.packingTips.length > 0 ? itinerary.packingTips : [];
  const safetyTips = itinerary.safetyAdvisory && itinerary.safetyAdvisory.length > 0 ? itinerary.safetyAdvisory : [];

  if (packingTips.length > 0 || safetyTips.length > 0) {
    ensureSpace(42);

    const sectionTitleY = yPos;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C.textDark);
    doc.text('TRIP ESSENTIALS & SAFETY ADVISORY', margin, sectionTitleY + 5);

    // Thin divider line
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.3);
    doc.line(margin, sectionTitleY + 7.5, margin + contentWidth, sectionTitleY + 7.5);

    yPos = sectionTitleY + 11;

    // Packing Box
    if (packingTips.length > 0) {
      const packingBoxY = yPos;
      
      // Calculate lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const measuredLines: string[][] = packingTips.map((tip) =>
        doc.splitTextToSize(`•  ${tip}`, contentWidth - 14)
      );
      const totalLineCount = measuredLines.reduce((acc, lines) => acc + lines.length, 0);
      const boxHeight = Math.max(16, 9 + totalLineCount * 3.8);

      ensureSpace(boxHeight + 4);

      doc.setFillColor(...C.bgCard);
      doc.setDrawColor(...C.indigoBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(...C.indigoDeep);
      doc.text('PACKING ESSENTIALS:', margin + 5, yPos + 6);

      // Bullets
      let bulletY = yPos + 10.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...C.textBody);
      measuredLines.forEach((lines) => {
        doc.text(lines, margin + 6, bulletY);
        bulletY += lines.length * 3.8;
      });

      yPos += boxHeight + 4;
    }

    // Safety Advisory Box
    if (safetyTips.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const measuredLines: string[][] = safetyTips.map((safe) =>
        doc.splitTextToSize(`•  ${safe}`, contentWidth - 14)
      );
      const totalLineCount = measuredLines.reduce((acc, lines) => acc + lines.length, 0);
      const boxHeight = Math.max(16, 9 + totalLineCount * 3.8);

      ensureSpace(boxHeight + 4);

      doc.setFillColor(...C.amberBg);
      doc.setDrawColor(...C.amberBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, 'FD');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(...C.amberText);
      doc.text('SAFETY & LOCAL ADVISORY:', margin + 5, yPos + 6);

      // Bullets
      let bulletY = yPos + 10.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...C.textDark);
      measuredLines.forEach((lines) => {
        doc.text(lines, margin + 6, bulletY);
        bulletY += lines.length * 3.8;
      });

      yPos += boxHeight + 6;
    }
  }

  // ----------------------------------------------------
  // 5. RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header on Pages 2 and later
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text(`EXPLORA AI  •  ${city.toUpperCase()}, ${country ? country.toUpperCase() : ''} (${totalDays} DAYS)`, margin, 13);
      doc.text('PERSONALIZED ITINERARY GUIDE', pageWidth - margin, 13, { align: 'right' });

      doc.setDrawColor(...C.borderLight);
      doc.setLineWidth(0.25);
      doc.line(margin, 15.5, pageWidth - margin, 15.5);
    }

    // Running Footer on ALL pages
    doc.setDrawColor(...C.borderLight);
    doc.setLineWidth(0.25);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    // Left Footer Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.textMuted);
    doc.text(`ExploraAI Travel Companion  •  ${city} Itinerary  •  Target Budget: ${totalBudget}`, margin, pageHeight - 6.5);

    // Right Footer Text (Page X of Y)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.textSecondary);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' });
  }

  // ----------------------------------------------------
  // 6. SAVE AND DOWNLOAD PDF
  // ----------------------------------------------------
  const safeCity = city.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `ExploraAI_${safeCity}_${totalDays}Day_Itinerary.pdf`;
  doc.save(filename);
}
