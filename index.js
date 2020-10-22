const voltTeamData = require("./volt-team-data");
const fs = require("fs");
const _ = require("lodash");
const sha1 = require("js-sha1");

const testlaufNummer = "hash-test-3";

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
		const votingToken = randomUnreadable();
		return {
			name: memberData[0],
			mail: memberData[1],
			membership: memberData[3],
			status: memberData[4],
			votingToken: votingToken,
			votingTokenHash: sha1(votingToken)
		};
	})
	.filter(member => {
		return member.status === "active";
	});

const sortedMembers = _.sortBy(members, "mail");


console.log(members.length);

const prefilledFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSdqAk9xN77nwk8mcwD3s21eDGTI6ss01Pb3ot2DK4EcTwPciw/viewform?usp=pp_url&entry.656190181=";

const wahlaufrufTestlauf1 = {
	subject: `Volt Mainz City-Lead-Wahl (Testlauf ${testlaufNummer}) - Jetzt abstimmen!`,
	body:  member => `Hallo ${member.name.split(" ").slice(0,1)},

Hier dein persönlicher Link zu Wählen: ${prefilledFormLink.replace("&", "%26")}${member.votingToken}

Dies ist dein Wahl-Token: ${member.votingToken}

Wichtig: Dein Wahl-Token bleibt nur anonym, solange du ihn geheim behälst. Wir löschen nach dem Versand alle Informationen. Daher können wir Token nicht mehr zuordnen und auch nicht erneut verschicken.



Nach Ende des Wahlgangs veröffentlichen wir die anonymen Wahlergebnisse, sodass du überprüfen kannst, dass deine Stimme korrekt gezählt wurde.

TESTLAUF HINWEIS: Bei Fragen zur technichen Umsetzung oder zum Testlauf einfach bei Tilman melden.

Viele Grüße,
Tilman und Sascha - Deine Wahlkommission
`
}

const mail = wahlaufrufTestlauf1;

const memberMailList = sortedMembers.map(member => `<li><a href="mailto:${member.mail}?subject=${mail.subject}&body=${mail.body(member).replace(/\n/g, "%0D%0A")}">${member.mail}</a></li>`).join("");


const votingMailFile = `voting-mails-${testlaufNummer}.html`;
const votingTokenHashFile = `valid-voting-tokens-hashes-${testlaufNummer}.csv`;


if (fs.existsSync(votingMailFile)) {
	console.error(`File ${votingMailFile} already exists`);
	process.exit(1);
}

if (fs.existsSync(votingTokenHashFile)) {
	console.error(`File ${votingTokenFile} already exists`);
	process.exit(1);
}


fs.writeFileSync(votingMailFile, `
<html>
<body>
<h1>Mail Liste</h1>

<ol>
${memberMailList}
</ol>
</body>
</html>
	`);


fs.writeFileSync(votingTokenHashFile, `${_.shuffle(members).map(member => member.votingTokenHash).join("\n")}`);
