Command Line Favorites
------------------------------------------
php dataprocess_herodata.php --log data/log/herodata.log --out data/output.json --dbout --mode=upsert



Command Lines for generating JSON output
------------------------------------------
php dataprocess_herodata.php --log data/log/herodata.log --out data/output.json



Command Lines For Getting Texture Diffs 
------------------------------------------
php dataprocess_herodata.php --log data/log/herodata.log --imageout --mode=append png data/textures data/images



Command Lines for getting file diffs by words
------------------------------------------
wdiff -3 -w"<~@OLD@~>" -x"</~@OLD@~>" -y"<~@NEW@~>" -z"</~@NEW@~>" data/OLD.json data/NEW.json



Directory information (for posterity)
------------------------------------------
listfiles/ 
   - Where herodata process should spit out list files of all relevant data so that CascView can quickly extract relevant data
heroesdata/
   - Where CascView will do it's extraction work
images/
   - Where herodata process will output image conversions of relevant data
log/
   - Where herodata process should log to (herodata.log)



Location of build id
----------------------------------------
mods/core.stormmod/base.stormdata/BuildId.txt



Location of all relevant Textures (Huge amount of irrelevant Textures inside, but this is a catch-all, use herodata process to narrow down to a listfile of relevant images)
-----------------------------------------
mods/heroes.stormmod/base.stormassets/Assets/Textures/



Location of all relevant Hero files (Some files inside of specific directories are irrelevant, but this is a catch-all list)
-----------------------------------------
mods/heroesdata.stormmod/base.stormdata/GameData/Heroes/
mods/heroesdata.stormmod/base.stormdata/GameData/ActorData.xml
mods/heroesdata.stormmod/base.stormdata/GameData/ButtonData.xml
mods/heroesdata.stormmod/base.stormdata/GameData/HeroData.xml
mods/heroesdata.stormmod/base.stormdata/GameData/TalentData.xml
mods/heroesdata.stormmod/enus.stormdata/LocalizedData/GameStrings.xml
mods/heromods/