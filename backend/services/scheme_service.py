from backend.services.ai_service import get_llm_response

# Indian Government Schemes Database
SCHEMES_KNOWLEDGE_BASE = [
    {
        "name": "PM-Kisan Samman Nidhi",
        "category": "Income Support",
        "eligibility": "Small and marginal farmer families with cultivable landholding of up to 2 hectares in their name.",
        "benefits": "₹6,000 per year, paid in three equal installments of ₹2,000 directly into the bank accounts of farmers.",
        "documents": "Aadhaar Card, Land ownership records (Khatauni/Patta), Bank Account, Mobile Number.",
        "apply_link": "https://pmkisan.gov.in"
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "category": "Crop Insurance",
        "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
        "benefits": "Financial support for crop losses due to natural calamities. Farmers pay only 1.5% premium for Rabi crops, 2.0% for Kharif crops, and 5.0% for commercial/horticultural crops; the rest is subsidized by the government.",
        "documents": "Land record copy, sowing certificate, bank details, identity proof (Aadhaar/Voter ID).",
        "apply_link": "https://pmfby.gov.in"
    },
    {
        "name": "Kisan Credit Card (KCC) Loan Scheme",
        "category": "Credit/Loans",
        "eligibility": "All farmers - individuals/joint borrowers, owner-cultivators, tenant farmers, sharecroppers, and self-help groups (SHGs).",
        "benefits": "Access to short-term credit loans for cultivation crops and farm maintenance at low interest rates (effectively 4% per annum with prompt repayment). Sums up to ₹3 Lakhs.",
        "documents": "Completed application form, identity proof, address proof, land holding documents, bank statement.",
        "apply_link": "https://www.sbi.co.in (or any public bank portal)"
    },
    {
        "name": "Subsidies on Agricultural Machinery (SMAM)",
        "category": "Subsidies & Equipment",
        "eligibility": "All categories of farmers. Preference given to Small, Marginal, SC, ST, and Women farmers.",
        "benefits": "40% to 80% subsidy for purchasing modern farming equipment (Tractors, Rotavators, Power Tillers, Seed Drills, Harvesters).",
        "documents": "Aadhaar card, Bank details, Land details, Category certificate (if SC/ST), quotation of machine.",
        "apply_link": "https://agrimachinery.nic.in"
    },
    {
        "name": "PM Krishi Sinchayee Yojana (Per Drop More Crop)",
        "category": "Irrigation",
        "eligibility": "Farmers having arable land. Members of cooperative farming societies, SHGs, and tenant farmers.",
        "benefits": "Up to 55% subsidy for Small & Marginal farmers, and 45% for other farmers for setting up Drip and Sprinkler irrigation systems.",
        "documents": "Aadhaar card, Land registration certificate, Electricity bill, Bank passbook, quotation from approved vendor.",
        "apply_link": "https://pmksy.gov.in"
    }
]

def search_schemes(query: str, farmer_profile_summary: str = "") -> str:
    """
    Simulates a RAG search. It uses the user's query and profile, searches the knowledge base,
    and uses the AI model to explain, filter, and recommend eligible schemes.
    """
    # Build context from our knowledge base
    context_entries = []
    for s in SCHEMES_KNOWLEDGE_BASE:
        entry = (
            f"Scheme Name: {s['name']}\n"
            f"Category: {s['category']}\n"
            f"Eligibility: {s['eligibility']}\n"
            f"Benefits: {s['benefits']}\n"
            f"Required Documents: {s['documents']}\n"
            f"Application Link: {s['apply_link']}\n"
            "---"
        )
        context_entries.append(entry)
        
    knowledge_context = "\n".join(context_entries)
    
    prompt = f"""
    Answer the farmer's query using only the retrieved government scheme documents below.
    If the answer or relevant scheme is not found in the database, say so instead of guessing.
    Include eligibility, required documents, benefits, and official application links when available.
    
    Farmer Profile Info (if any):
    {farmer_profile_summary}
    
    Farmer's Query:
    "{query}"
    
    Retrieved Scheme Documents:
    {knowledge_context}
    """
    
    system_prompt = """
    You are Farmer Copilot, an expert advisor on Indian agricultural welfare schemes.
    Answer only using the retrieved government scheme documents. If the answer is not found in the knowledge base, say so instead of guessing.
    Structure the response clearly with bullet points, highlighting eligibility criteria and application links.
    """
    
    response = get_llm_response(prompt, system_instruction=system_prompt)
    return response
