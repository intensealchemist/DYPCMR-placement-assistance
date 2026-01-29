import urllib.parse
password = "QDvL#cd8qYy2n%$"
encoded = urllib.parse.quote(password)
print(f"Your safe password string is: {encoded}")