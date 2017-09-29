# koda-backup
Med hjälp av koda-backup kan du ladda ner dina koda.nu-projekt via terminalen,
och spara dem i antingen vanliga mappar eller zip-filer.

## options.json

Det finns en options.json-fil med följande struktur: (Ta inte bort filen)

```
email:    string
password: string
zipFiles: bool
verbose:  bool
```

Om email och/eller password inte är tomma, kommer skriptet använda de fälten
i stället för att fråga. Om verbose är true, kommer mer utförliga felmeddelanden
skrivas ut om det blir något fel.

## Användning:

Du måste ha nodejs, npm och git installerat. Både Linux, Mac och Windows fungerar.

Börja med att öppna något form av terminalfönster i lämplig katalog. Skriv sedan följande kommandon:
(Om du använder cmd i stället PowerShell i Windows måste du ta bort kommentarerna på slutet)

```
git clone https://github.com/ekner/koda-backup.git  # Ladda ner skriptet
cd koda-backup                                      # Gå in i mappen
npm install                                         # Installera modulerna för skriptet
node koda-backup.js                                 # Kör skriptet
```
