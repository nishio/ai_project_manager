import re


def find_next_available_id(used_ids, request=1):
    valid_ids = [id for id in used_ids if re.match(r"^T\d{4}$", id)]
    used_numbers = sorted(int(id[1:]) for id in valid_ids)
    result = []
    for i in range(1, used_numbers[-1] + 2):
        if i not in used_numbers:
            if request == 1:
                return f"T{i:04}"
            result.append(f"T{i:04}")
            if len(result) == request:
                break
    return result
