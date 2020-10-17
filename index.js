const voltTeamData = require("./volt-team-data");
const fs = require("fs");
const _ = require("lodash");


function randomUnreadable() {
    const randomValueOf = (values) => {
        const duplicateValues = values;
        return () => duplicateValues[Math.floor(Math.random() * duplicateValues.length)]
    };
    const transformToRandom = (input, values) => input.split("").map(randomValueOf(values)).join("");

    return "X"
        + transformToRandom("0000", "xyzktf" + "xyzktf".toUpperCase()) 
        + transformToRandom("000000000000000000", "bcdfghjklmnpqrstvwxyz0123456789" + "bcdfghjklmnpqrstvwxyz".toUpperCase())
        + transformToRandom("0000", "xyzktf" + "xyzktf".toUpperCase()) + "X"
}


const members = voltTeamData.split("\n")
	.slice(1)
	.map(memberLine => {
		const memberData = memberLine.split("\t");
		return {
			name: memberData[0],
			mail: memberData[1],
			membership: memberData[3],
			status: memberData[4],
			votingToken: randomUnreadable()
		};
	})
	.filter(member => {
		return member.status === "active";
	});

const sortedMembers = _.sortBy(members, "mail");


console.log(members.length);


const wahlaufrufTestlauf1 = {
	subject: "Volt Mainz City-Lead-Wahl (Testlauf) - Jetzt abstimmen!",
	body:  member => `Hallo ${member.name.split(" ").slice(0,1)},

Hier dein persönlicher Link zu Wählen: https://docs.google.com/forms/d/e/1FAIpQLSfRsx991dR22DoqLeeOwvqcg2DlTirqCFBIh28wnHRD8ADsNg/viewform?usp=pp_url%26entry.656190181=${member.votingToken}

Dies ist dein Wahl-Token: ${member.votingToken}

Wichtig: Gibt niemandem dieses Token und behalte die Mail bis zur Abstimmung. Wir können es nach dem Versand nicht mehr zuordnen und auch nicht erneut verschicken.

Nach Ende des Wahlgangs veröffentlichen wir die anonymen Wahlergebnisse, sodass du überprüfen kannst, dass deine Stimme korrekt gezählt wurde.

TESTLAUF HINWEIS: Bei Fragen zur technichen Umsetzung oder zum Testlauf einfach bei Tilman melden.

Viele Grüße,
Tilman und Sascha - Deine Wahlkommission
`
}

const mail = wahlaufrufTestlauf1;

const memberMailList = sortedMembers.map(member => `<li><a href="mailto:${member.mail}?subject=${mail.subject}&body=${mail.body(member).replace(/\n/g, "%0D%0A")}">${member.mail}</a></li>`).join("");

fs.writeFileSync("voting-mails.html", `
<html>
<body>
<h1>Mail Liste</h1>

<ol>
${memberMailList}
</ol>
</body>
</html>
	`);

fs.writeFileSync("valid-voting-tokens.csv", `${_.shuffle(members).map(member => member.votingToken).join("\n")}`);

