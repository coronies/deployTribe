import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def extract_fafsa_deadline(url: str) -> str:
    """Custom extractor for the FAFSA deadline page."""
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        text = ''
        for tag in soup.find_all(['h1', 'h2', 'h3', 'p', 'li']):
            if 'fafsa' in tag.get_text(strip=True).lower() and 'deadline' in tag.get_text(strip=True).lower():
                text += tag.get_text(strip=True) + '\n'
        if not text:
            text = soup.get_text(separator=' ', strip=True)
        return text[:2000]
    except Exception as e:
        logger.error(f"Custom extraction failed for {url}: {e}")
        return f"[Custom extraction failed: {e}]"

# A dictionary to map URL substrings to their custom extractor functions.
# This makes it easy to add new extractors for different URLs.
CUSTOM_EXTRACTORS = {
    'onestop.utexas.edu/managing-costs/scholarships-financial-aid': extract_fafsa_deadline,
}
