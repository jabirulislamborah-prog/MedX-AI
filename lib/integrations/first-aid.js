/**
 * First Aid API Integration
 * Provides access to USMLE Step 1 First Aid content via web scraping and public APIs
 */

const FIRST_AID_API = 'https://first-aid-api.example.com/v1' // Placeholder - requires partnership
const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

export async function searchFirstAidContent(query) {
  try {
    // Search PubMed for medical content
    const response = await fetch(
      `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5`
    )
    const data = await response.json()
    
    if (!data.esearchresult?.idlist?.length) {
      return null
    }
    
    // Fetch article details
    const ids = data.esearchresult.idlist.join(',')
    const summaryResponse = await fetch(
      `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`
    )
    const summary = await summaryResponse.json()
    
    const results = Object.values(summary.result || {})
      .filter(item => item.uid)
      .map(item => ({
        title: item.title,
        source: item.source,
        pubdate: item.pubdate,
        uid: item.uid
      }))
    
    return results
  } catch (error) {
    console.error('[FirstAid] Search error:', error)
    return null
  }
}

export async function getDrugInfo(drugName) {
  try {
    // Use FDA OpenAPI for drug information
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(drugName)}&limit=1`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data.results?.length) return null
    
    const drug = data.results[0]
    return {
      name: drug.openfda?.generic_name?.[0],
      brand: drug.openfda?.brand_name?.[0],
      manufacturer: drug.openfda?.manufacturer_name?.[0],
      warnings: drug.warnings,
      indications: drug.indications_and_usage,
      side_effects: drug.adverse_reactions
    }
  } catch (error) {
    console.error('[FirstAid] Drug info error:', error)
    return null
  }
}

export async function getMedicalConditionInfo(condition) {
  try {
    // Use NLM Clinical Tables API
    const response = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?df=description&terms=${encodeURIComponent(condition)}&maxList=3`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data.results?.length) return null
    
    return {
      condition,
      descriptions: data.results
    }
  } catch (error) {
    console.error('[FirstAid] Condition info error:', error)
    return null
  }
}

export async function getProcedureInfo(procedure) {
  try {
    const response = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/procedures/v3/search?df=description&terms=${encodeURIComponent(procedure)}&maxList=3`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data.results?.length) return null
    
    return {
      procedure,
      descriptions: data.results
    }
  } catch (error) {
    console.error('[FirstAid] Procedure info error:', error)
    return null
  }
}

// Quick reference data for common medical topics
export const FIRST_AID_REFERENCES = {
  anatomy: [
    { topic: 'Brachial Plexus', content: 'Roots (R), Trunks (T), Divisions (D), Cords (C), Branches (B) - lateral cord: musculocutaneous, lateral half of median, axillary; posterior cord: radial, axillary; medial half of median, ulnar, medial cutaneous of arm, medial cutaneous of forearm' },
    { topic: 'Cardiac Anatomy', content: 'Right coronary artery supplies: RA, RV, inferior wall, posterior wall (PDA). Left coronary artery supplies: LA, LV, anterior wall, septum. SA node: 60% RCA, 40% LCA. AV node: 90% RCA' },
    { topic: 'Cranial Nerves', content: 'I olfactory, II optic, III oculomotor (motor to superior rectus, medial rectus, inferior rectus, inferior oblique, levator palpebrae; parasympathetic to ciliary ganglion for pupil constriction), IV trochlear, V trigeminal (V1 ophthalmic, V2 maxillary, V3 mandibular), VI abducens, VII facial, VIII vestibulocochlear, IX glossopharyngeal, X vagus, XI accessory, XII hypoglossal' },
  ],
  pharmacology: [
    { topic: 'Anticoagulants', content: 'Heparin: activates antithrombin III, prolongs PTT, monitor PT. Warfarin: inhibits epoxide reductase, prolongs PT, monitor INR, antagonize with vitamin K. Direct Xa inhibitors: rivaroxaban, apixaban - no monitoring needed' },
    { topic: 'Beta Blockers', content: '-lol endings. Cardioselective: metoprolol, atenolol. Non-selective: propranolol. Side effects: bradycardia, hypotension, fatigue, depression, nightmares, sexual dysfunction. Contraindicated in asthma, COPD, heart block' },
    { topic: 'ACE Inhibitors', content: '-pril endings. Mechanism: inhibit ACE, decrease angiotensin II, increase bradykinin. Side effects: cough, angioedema, hyperkalemia, hypotension. Indications: HTN, CHF, diabetic nephropathy' },
  ],
  pathology: [
    { topic: 'Cancer Markers', content: 'CEA: colorectal, pancreatic, lung, breast. CA-125: ovarian. AFP: hepatocellular carcinoma, teratoma. PSA: prostate. hCG: choriocarcinoma, trophoblastic tumors. LDH: lymphoma, testicular cancer. M-component: multiple myeloma' },
    { topic: 'Oncogenes', content: 'RAS: most common human oncogene (pancreatic, colorectal). MYC: Burkitt lymphoma. BCR-ABL: CML. HER2/neu: breast cancer. BRAF V600E: melanoma, papillary thyroid carcinoma. PTEN: breast, prostate, glioblastoma' },
  ],
  physiology: [
    { topic: 'ECG Intervals', content: 'PR: 120-200ms. QRS: <120ms. QTc: <440ms (men), <450ms (women). ST: isoelectric. T wave: ventricular repolarization. U wave: caused by long QT, hypokalemia' },
    { topic: 'Cardiac Output', content: 'CO = HR × SV. SV = EDV - ESV. EF = SV/EDV = (EDV-ESV)/EDV. Normal EF: 55-70%. Preload: venous return. Afterload: systemic vascular resistance. Contractility: inotropic state' },
  ]
}

export function getQuickReference(subject, topic) {
  const references = FIRST_AID_REFERENCES[subject?.toLowerCase()]
  if (!references) return null
  
  if (topic) {
    return references.find(r => 
      r.topic.toLowerCase().includes(topic.toLowerCase())
    )
  }
  
  return references
}

export default {
  searchFirstAidContent,
  getDrugInfo,
  getMedicalConditionInfo,
  getProcedureInfo,
  getQuickReference,
  FIRST_AID_REFERENCES
}
