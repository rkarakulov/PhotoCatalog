@echo off
:: Online Registry data initial import script

echo Clearing collections data...
mongo OnlineRegistryDb --eval "db.ImportLog.remove()"
mongo OnlineRegistryDb --eval "db.Shipping.remove()"
mongo OnlineRegistryDb --eval "db.Terbank.remove()"
mongo OnlineRegistryDb --eval "db.Card.remove()"

#echo Importing ImportLog collection...
#mongoimport --db OnlineRegistryDb --collection ImportLog --type csv --file ImportLog.csv --headerline
#:: Covert dates
#mongo OnlineRegistryDb --eval "db.ImportLog.find().forEach(function(item) { item.date = new Date(item.date); db.ImportLog.save(item) });"

#echo Importing Shipping collection...
#mongoimport --db OnlineRegistryDb --collection Shipping --type csv --file Shipping.csv --headerline
#:: Covert dates
#mongo OnlineRegistryDb --eval "db.Shipping.find().forEach(function(item) { var parts = item.date.split('.'); item.date = new Date(parts[1] + '/' + parts[0] + '/' + parts[2] + ' 00:00:00 +0400'); db.Shipping.save(item) });"

#echo Importing Terbank collection...
#mongoimport --db OnlineRegistryDb --collection Terbank --type csv --file Terbank.csv --headerline

#echo Importing Card collection...
#node Card.js

#echo Importing process finished.


