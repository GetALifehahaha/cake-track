import nanoid

# Custom alphabet to avoid ambiguous characters (like 0, O, I, l)
ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"

def generate_id(prefix):
    nid = nanoid.generate(alphabet=ALPHABET, size=10)
    return f"{prefix}-{nid}"
