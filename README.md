# Heroes of the Storm Data Web Application
### Working Name = 'Hotstatus'

Contains src for the web application built in symfony3, as well as the php cgi files used for the replay ETL pipeline.

Hotstatus is a web application that aggregates statistics from Heroes of the Storm matches
parsed from replay files. It provides a way to relate useful statistics about Heroes, Talents, Maps, and Players. One major
goal of the project is to provide player profiles that show players their personalized
statistics as well as match history and an approximated matchmaking rating.

One major feature of the hotstatus pipeline developed for processing data is that all Hero, Talent, and Image information
from the Heroes of the Storm game is extracted, formatted, and converted into useful structures without having to manually compile large listfiles.

Inspirations for this project are [na.op.gg](http://na.op.gg), [champion.gg](http://www.champion.gg), [hotslogs.com](http://www.hotslogs.com), [stormspy.net](http://www.stormspy.net), and this project absolutely
could not exist without the work done by Roman Semenov in setting up [hotsapi.net](http://hotsapi.net), which provides a centralized
replay dataset.

<b>CGI Libraries (cgi/lib)</b>
- [AWS Php SDK](https://aws.amazon.com/sdk-for-php/)
- [Fizzik](https://github.com/maximtiourin/Fizzik)

<b>CGI Utilities (System Path)</b>
- [ImageMagick](https://www.imagemagick.org/script/index.php)
- [wdiff (Windows)](https://www.di-mgt.com.au/wdiff-for-windows.html) | [wdiff (Linux)](https://www.gnu.org/software/wdiff/)

<b>CGI Additional Binaries (cgi/bin)</b>
- [ReplayParser](https://github.com/maximtiourin/Heroes.ReplayParser) (Compile ConsoleApplication and point HotstatusPipeline to its executable)
- [Skills](https://github.com/maximtiourin/Skills) (Compile ConsoleApplication and point HotstatusPipeline to its executable)

<b>Special Thanks</b>:
- Roman Semenov [poma] (Heroes of the Storm replay API - Hotsapi.net)
- Ben Barrett [barrett777] (Heroes of the Storm C# Replay Parser Library - Heroes.ReplayParser)
- Jeff Moser [Moserware] (TrueSkill MMR - Skills)