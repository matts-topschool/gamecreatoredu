"""
CTF (Common Transfer File) Parser Service
Parses UK Department for Education Common Transfer Files for student data import.

CTF is the standard XML format used in UK schools for transferring pupil data.
Supported formats: CTF 18.0, CTF 17.0, CTF 15.0
"""
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import logging
import re

logger = logging.getLogger(__name__)


class CTFStudent(BaseModel):
    """Parsed student data from CTF file."""
    upn: Optional[str] = None  # Unique Pupil Number
    uln: Optional[str] = None  # Unique Learner Number
    forename: str
    surname: str
    preferred_surname: Optional[str] = None
    former_surname: Optional[str] = None
    middle_names: Optional[str] = None
    gender: Optional[str] = None  # M/F
    dob: Optional[str] = None  # Date of birth
    
    # Contact info
    email: Optional[str] = None
    
    # School info
    year_group: Optional[str] = None  # NC Year (Reception, 1-13)
    registration_group: Optional[str] = None  # Form/class
    house: Optional[str] = None
    
    # SEN (Special Educational Needs)
    sen_provision: Optional[str] = None  # N/E/K/S/A
    
    # FSM (Free School Meals)
    fsm_eligible: Optional[bool] = None
    
    # Ethnicity & Language
    ethnicity: Optional[str] = None
    first_language: Optional[str] = None
    
    # Address
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    town: Optional[str] = None
    postcode: Optional[str] = None
    
    # Contacts
    contacts: List[Dict[str, Any]] = []
    
    # Raw data for any unmapped fields
    metadata: Dict[str, Any] = {}


class CTFParseResult(BaseModel):
    """Result of parsing a CTF file."""
    success: bool
    version: Optional[str] = None
    source_school: Optional[Dict[str, str]] = None
    dest_school: Optional[Dict[str, str]] = None
    students: List[CTFStudent] = []
    errors: List[str] = []
    warnings: List[str] = []
    total_records: int = 0


def parse_ctf_file(file_content: bytes, filename: str = "unknown.xml") -> CTFParseResult:
    """
    Parse a CTF XML file and extract student data.
    
    Args:
        file_content: Raw bytes of the CTF file
        filename: Original filename for error reporting
        
    Returns:
        CTFParseResult with parsed students and any errors
    """
    result = CTFParseResult(success=False)
    
    try:
        # Try to decode as UTF-8 or UTF-16
        try:
            content_str = file_content.decode('utf-8-sig')
        except UnicodeDecodeError:
            try:
                content_str = file_content.decode('utf-16')
            except UnicodeDecodeError:
                content_str = file_content.decode('latin-1')
        
        # Parse XML
        root = ET.fromstring(content_str)
        
        # Detect CTF namespace and version
        ns = extract_namespace(root)
        result.version = detect_ctf_version(root, ns)
        
        logger.info(f"Parsing CTF file {filename}, version: {result.version}")
        
        # Parse header info
        header = root.find(f".//{ns}Header") or root.find(".//Header")
        if header is not None:
            result.source_school = parse_school_info(header, ns, "Source")
            result.dest_school = parse_school_info(header, ns, "Dest")
        
        # Find all pupil records
        # CTF uses different element names in different versions
        pupil_elements = (
            root.findall(f".//{ns}Pupil") or 
            root.findall(".//Pupil") or
            root.findall(f".//{ns}CTFpupilData") or
            root.findall(".//CTFpupilData")
        )
        
        result.total_records = len(pupil_elements)
        
        for pupil_elem in pupil_elements:
            try:
                student = parse_pupil_element(pupil_elem, ns)
                if student:
                    result.students.append(student)
            except Exception as e:
                result.warnings.append(f"Failed to parse pupil record: {str(e)}")
        
        result.success = True
        logger.info(f"Successfully parsed {len(result.students)} students from CTF")
        
    except ET.ParseError as e:
        result.errors.append(f"XML parsing error: {str(e)}")
        logger.error(f"CTF XML parse error: {e}")
    except Exception as e:
        result.errors.append(f"Unexpected error: {str(e)}")
        logger.error(f"CTF parse error: {e}")
    
    return result


def extract_namespace(root: ET.Element) -> str:
    """Extract XML namespace from root element."""
    match = re.match(r'\{(.+?)\}', root.tag)
    if match:
        return "{" + match.group(1) + "}"
    return ""


def detect_ctf_version(root: ET.Element, ns: str) -> str:
    """Detect CTF version from file."""
    # Try to find version in header or root attributes
    version_elem = root.find(f".//{ns}CTFversion") or root.find(".//CTFversion")
    if version_elem is not None and version_elem.text:
        return version_elem.text
    
    # Check for version in namespace
    if "CTF18" in ns or "18.0" in ns:
        return "18.0"
    elif "CTF17" in ns or "17.0" in ns:
        return "17.0"
    elif "CTF15" in ns or "15.0" in ns:
        return "15.0"
    
    return "unknown"


def parse_school_info(header: ET.Element, ns: str, prefix: str) -> Optional[Dict[str, str]]:
    """Parse source or destination school info from header."""
    school_elem = header.find(f".//{ns}{prefix}School") or header.find(f".//{prefix}School")
    if school_elem is None:
        return None
    
    return {
        "lea": get_element_text(school_elem, f"{ns}LEA") or get_element_text(school_elem, "LEA"),
        "estab": get_element_text(school_elem, f"{ns}Estab") or get_element_text(school_elem, "Estab"),
        "school_name": get_element_text(school_elem, f"{ns}SchoolName") or get_element_text(school_elem, "SchoolName"),
        "urn": get_element_text(school_elem, f"{ns}URN") or get_element_text(school_elem, "URN")
    }


def get_element_text(parent: ET.Element, tag: str) -> Optional[str]:
    """Safely get text content of a child element."""
    elem = parent.find(tag)
    if elem is not None and elem.text:
        return elem.text.strip()
    return None


def parse_pupil_element(pupil: ET.Element, ns: str) -> Optional[CTFStudent]:
    """Parse a single pupil element into CTFStudent."""
    
    def get_text(tag: str) -> Optional[str]:
        return get_element_text(pupil, f"{ns}{tag}") or get_element_text(pupil, tag)
    
    # Required fields
    forename = get_text("Forename") or get_text("GivenName")
    surname = get_text("Surname") or get_text("FamilyName")
    
    if not forename and not surname:
        return None
    
    student = CTFStudent(
        forename=forename or "Unknown",
        surname=surname or "Unknown",
        upn=get_text("UPN"),
        uln=get_text("ULN"),
        preferred_surname=get_text("PreferredSurname"),
        former_surname=get_text("FormerSurname"),
        middle_names=get_text("MiddleNames"),
        gender=get_text("Gender") or get_text("Sex"),
        dob=get_text("DOB") or get_text("DateOfBirth"),
        email=get_text("Email"),
        year_group=get_text("NCyearActual") or get_text("YearGroup"),
        registration_group=get_text("RegGroup") or get_text("RegistrationGroup"),
        house=get_text("House"),
        sen_provision=get_text("SENprovision") or get_text("SEN"),
        ethnicity=get_text("Ethnicity") or get_text("EthnicGroup"),
        first_language=get_text("FirstLanguage") or get_text("Language")
    )
    
    # Parse FSM
    fsm_text = get_text("FSMeligible") or get_text("FSM")
    if fsm_text:
        student.fsm_eligible = fsm_text.upper() in ("TRUE", "YES", "Y", "1")
    
    # Parse address
    address_elem = pupil.find(f".//{ns}Address") or pupil.find(".//Address")
    if address_elem is not None:
        student.address_line1 = get_element_text(address_elem, f"{ns}AddressLine1") or get_element_text(address_elem, "AddressLine1") or get_element_text(address_elem, f"{ns}PAON") or get_element_text(address_elem, "PAON")
        student.address_line2 = get_element_text(address_elem, f"{ns}AddressLine2") or get_element_text(address_elem, "AddressLine2") or get_element_text(address_elem, f"{ns}Street") or get_element_text(address_elem, "Street")
        student.town = get_element_text(address_elem, f"{ns}Town") or get_element_text(address_elem, "Town")
        student.postcode = get_element_text(address_elem, f"{ns}Postcode") or get_element_text(address_elem, "Postcode")
    
    # Parse contacts
    contacts_elem = pupil.find(f".//{ns}Contacts") or pupil.find(".//Contacts")
    if contacts_elem is not None:
        for contact_elem in contacts_elem.findall(f".//{ns}Contact") or contacts_elem.findall(".//Contact"):
            contact = {
                "title": get_element_text(contact_elem, f"{ns}Title") or get_element_text(contact_elem, "Title"),
                "forename": get_element_text(contact_elem, f"{ns}Forename") or get_element_text(contact_elem, "Forename"),
                "surname": get_element_text(contact_elem, f"{ns}Surname") or get_element_text(contact_elem, "Surname"),
                "relationship": get_element_text(contact_elem, f"{ns}Relationship") or get_element_text(contact_elem, "Relationship"),
                "email": get_element_text(contact_elem, f"{ns}Email") or get_element_text(contact_elem, "Email"),
                "telephone": get_element_text(contact_elem, f"{ns}TelephoneNo") or get_element_text(contact_elem, "TelephoneNo") or get_element_text(contact_elem, f"{ns}Phone") or get_element_text(contact_elem, "Phone")
            }
            # Only add if has meaningful data
            if any(v for v in contact.values() if v):
                student.contacts.append(contact)
    
    return student


def parse_csv_students(
    file_content: bytes, 
    column_mapping: Dict[str, str],
    has_header: bool = True
) -> CTFParseResult:
    """
    Parse a CSV file with student data.
    
    Args:
        file_content: Raw bytes of CSV file
        column_mapping: Dict mapping our fields to CSV column names/indices
            e.g., {"forename": "First Name", "surname": "Last Name", "email": "Email"}
        has_header: Whether CSV has a header row
        
    Returns:
        CTFParseResult with parsed students
    """
    import csv
    import io
    
    result = CTFParseResult(success=False)
    
    try:
        # Decode content
        try:
            content_str = file_content.decode('utf-8-sig')
        except UnicodeDecodeError:
            content_str = file_content.decode('latin-1')
        
        reader = csv.DictReader(io.StringIO(content_str)) if has_header else csv.reader(io.StringIO(content_str))
        
        for row_num, row in enumerate(reader, start=2 if has_header else 1):
            try:
                if has_header:
                    # Row is a dict
                    student_data = {}
                    for our_field, csv_field in column_mapping.items():
                        if csv_field in row:
                            student_data[our_field] = row[csv_field]
                else:
                    # Row is a list, column_mapping values should be indices
                    student_data = {}
                    for our_field, csv_idx in column_mapping.items():
                        idx = int(csv_idx)
                        if idx < len(row):
                            student_data[our_field] = row[idx]
                
                # Create student if we have at least a name
                if student_data.get("forename") or student_data.get("surname"):
                    student = CTFStudent(
                        forename=student_data.get("forename", "Unknown"),
                        surname=student_data.get("surname", "Unknown"),
                        email=student_data.get("email"),
                        upn=student_data.get("upn"),
                        year_group=student_data.get("year_group"),
                        registration_group=student_data.get("registration_group") or student_data.get("class")
                    )
                    result.students.append(student)
                    result.total_records += 1
                    
            except Exception as e:
                result.warnings.append(f"Row {row_num}: {str(e)}")
        
        result.success = True
        logger.info(f"Parsed {len(result.students)} students from CSV")
        
    except Exception as e:
        result.errors.append(f"CSV parsing error: {str(e)}")
        logger.error(f"CSV parse error: {e}")
    
    return result


# Standard CSV column mappings for common export formats
STANDARD_CSV_MAPPINGS = {
    "sims": {
        "forename": "Forename",
        "surname": "Surname", 
        "email": "Email",
        "upn": "UPN",
        "year_group": "Year",
        "registration_group": "Reg"
    },
    "arbor": {
        "forename": "First name",
        "surname": "Last name",
        "email": "Email",
        "upn": "UPN",
        "year_group": "Year group",
        "registration_group": "Registration form"
    },
    "bromcom": {
        "forename": "FirstName",
        "surname": "LastName",
        "email": "StudentEmail",
        "upn": "UPN",
        "year_group": "YearGroup",
        "registration_group": "Form"
    },
    "generic": {
        "forename": "First Name",
        "surname": "Last Name",
        "email": "Email",
        "year_group": "Year",
        "registration_group": "Class"
    }
}
