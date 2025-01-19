def find_next_available_id(used_ids):
    used_numbers = sorted(int(id[1:]) for id in used_ids if id.startswith("T"))
    for i in range(1, 10000):
        if i not in used_numbers:
            return f"T{i:04}"
