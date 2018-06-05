# koda-backup
Med hjälp av koda-backup kan du ladda ner dina koda.nu-projekt via terminalen,
och spara dem i antingen vanliga mappar eller zip-filer.

## options.json

Det finns en options.json-fil med följande struktur (ta inte bort filen):

```
email:    textsträng
password: textsträng
zipFiles: true/false
verbose:  true/false
```

Om email och/eller password inte är tomma, kommer skriptet använda de fälten
i stället för att fråga. Om verbose är true, kommer mer utförliga felmeddelanden
skrivas ut om det blir något fel.

## Användning:

Du måste ha nodejs, npm och git installerat. Både Linux, Mac och Windows fungerar.

Börja med att öppna något form av terminalfönster i lämplig katalog. Skriv sedan följande kommandon:
(om du använder CMD i stället för PowerShell i Windows måste du ta bort kommentarerna på slutet)

```
git clone https://github.com/ekner/koda-backup.git  # Ladda ner skriptet
cd koda-backup                                      # Gå in i mappen
npm install                                         # Installera modulerna för skriptet
node koda-backup.js                                 # Kör skriptet
```

## Exempel:

Om du inte vill spara ditt lösenord i klartext i options.json finns ett alternativ i Ubuntu, om du har sparat ditt lösenord för koda.nu i Chrome/Opera. Nedanstående kommando kommer extrahera det lösenordet, skriva ut det tillsammans med en mejladress och sedan köra koda-backup med det som input. Kom ihåg att byta ut mejlen mot din egna, och installera libsecret-tools om inte secret-tool finns.

```
echo -e "test.testsdotter@example.com\n$(secret-tool lookup action_url http://koda.nu/login)" | node koda-backup.js
```
