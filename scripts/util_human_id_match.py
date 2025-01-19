def human_id_match(target, given):
    """
    >>> human_id_match("T0014", "14")
    True
    """
    if target == "":
        return False
    if target == given:
        return True
    if target[1:].lstrip("0") == given:
        return True
