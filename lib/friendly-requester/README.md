- Log in and get cookie
- Parse forum friendly page, get profile id <a class="bold" href="/?p=profile&amp;uid=8378032">od16</a>
- Go to profile page
- Get teamid <a href="/?p=team&tid=134327">Team Home</a>
# - Get country_id
- Send challange request
Request URL:http://www.managerzone.com/?p=challenges&sub=action&action=create&tid=134327&country_id=242
Request Method:POST
Status Code:302 Found

Query string params:
p:challenges
sub:action
action:create
tid:134327
# country_id:242 # You don't really need country id, its only used for some broken image rendering lol

Post params
date:1460412000,11 <- date = day, time = (random) hour
place:0

How to guarantee that the challange will happen?
Maybe parse if they have challanges?
