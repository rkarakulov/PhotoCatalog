@echo off
:: Online Registry data initial import script

echo Removing users collection...
mongo OnlineRegistryDb --eval "db.User.remove()"

echo Creating User collection...

mongo OnlineRegistryDb --eval "db.createCollection('User', { capped : true, size : 5242880, max : 5000 } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'admin@user.com', 'login' : 'superAdmin', 'password' : '123', 'role' : 'superAdmin', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'user@user.com', 'login' : 'user', 'password' : '123', 'role' : 'none', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'user@user.com', 'login' : 'admin', 'password' : '123', 'role' : 'admin', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'user@user.com', 'login' : 'search', 'password' : '123', 'role' : 'search', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'user@user.com', 'login' : 'report', 'password' : '123', 'role' : 'report', 'salt' : '' } )"


mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'sst@user.com', 'login' : 'sst', 'password' : 'UeRUBSAHRPp6wjTD', 'role' : 'admin', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'sber@user.com', 'login' : 'sber', 'password' : 'Mbw9HFauGdHJZnL2', 'role' : 'search', 'salt' : '' } )"

mongo OnlineRegistryDb --eval "db.User.insert( { 'email' : 'sberca@user.com', 'login' : 'sberca', 'password' : '5hUDznSuSBTEHyWs', 'role' : 'report', 'salt' : '' } )"

echo User creation finished.

