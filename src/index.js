import Canvas from "./canvas";
import { faker } from "@faker-js/faker";

const data = [
	// {
	// 	text: "",
	// 	url: "assets/images/1.jpg",
	// },
];

for (let index = 0; index < 15; index++) {
	data.push({
		text: faker.word.noun(),
		url: faker.image.imageUrl(800, 600, "", true),
	});
}
const canvas = new Canvas(data);
