from datetime import date


SUGARCANE_VARIETIES = {
    "Co 86032 (Nira)",
    "Co 0238",
    "Co 15023",
    "Co 99004",
    "CoC 671",
}

SOIL_TYPES = {
    "Medium Black Soil (Vertisol)",
    "Deep Black Soil (Vertisol)",
    "Alluvial Soil",
    "Red Loamy Soil",
    "Sandy Loam",
}

GROWTH_STAGES = {
    "Germination (0-45 days)",
    "Tillering (46-100 days)",
    "Grand Growth (101-270 days)",
    "Maturity (271-365 days)",
}

REQUIRED_FIELDS = (
    "farm_name",
    "location",
    "area",
    "sugarcane_variety",
    "soil_type",
    "plantation_date",
    "growth_stage",
)


def validate_farm(payload):
    errors = {}

    for field in REQUIRED_FIELDS:
        value = payload.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors[field] = "This field is required."

    if errors:
        return errors

    try:
        area = float(payload["area"])
        if area <= 0:
            errors["area"] = "Farm area must be greater than zero."
        elif area > 100000:
            errors["area"] = "Farm area is outside the supported range."
    except (TypeError, ValueError):
        errors["area"] = "Enter a valid numeric farm area."

    if payload["sugarcane_variety"] not in SUGARCANE_VARIETIES:
        errors["sugarcane_variety"] = "Select a supported sugarcane variety."

    if payload["soil_type"] not in SOIL_TYPES:
        errors["soil_type"] = "Select a supported soil type."

    if payload["growth_stage"] not in GROWTH_STAGES:
        errors["growth_stage"] = "Select a valid crop growth stage."

    try:
        plantation_date = date.fromisoformat(payload["plantation_date"])
        if plantation_date > date.today():
            errors["plantation_date"] = "Plantation date cannot be in the future."
    except (TypeError, ValueError):
        errors["plantation_date"] = "Enter a valid plantation date."

    return errors
