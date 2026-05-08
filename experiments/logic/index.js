function removeFirst(string, substring) {
	return string.trim().split(substring).slice(1).join(substring).trim();
}

function isValidPropositionChar(i) {
	return i > 96 && i < 123;
}

function parseProposition(formula) {
	formula = formula.trim();
	let proposition = "";
	while (isValidPropositionChar(formula.charCodeAt(0))) {
		proposition += formula[0];
		formula = formula.slice(1);
	}
	if (!proposition.length) return [formula, null];
	formula = formula.trim();
	return [formula, proposition];
}

function parseAtom(formula) {
	if (formula.trim().startsWith("(")) {
		formula = removeFirst(formula, "(");
		let [newFormula, parsed] = parse(formula);
		if (!newFormula.trim().startsWith(")")) throw new Error("Expected closing parenthesis");
		newFormula = removeFirst(newFormula, ")");
		if (!parsed) throw new Error("Expected expression within parentheses");
		return [newFormula, parsed];
	}

	return parseProposition(formula);
}

function parseNegation(formula) {
	let negations = 0;
	while (formula.trim().startsWith("~")) {
		negations++;
		formula = removeFirst(formula, "~");
	}

	const [newFormula, atom] = parseAtom(formula);
	if (!atom) {
		if (negations) throw new Error("Expected proposition after '~'");
		else return [newFormula, null];
	}

	let negation = atom;
	while (negations--) negation = {type: "not", value: negation};

	return [newFormula, negation];
}

function parseAnd(formula) {
	let [newFormula, lhs] = parseNegation(formula);
	if (!lhs) return [newFormula, null];

	while (newFormula.trim().startsWith("&")) {
		newFormula = removeFirst(newFormula, "&");
		const [newNewFormula, rhs] = parseNegation(newFormula);
		newFormula = newNewFormula;
		if (!rhs) throw new Error("Expected proposition after '&'");
		lhs = {type: "and", lhs, rhs};
	}

	return [newFormula, lhs];
}

function parseOr(formula) {
	let [newFormula, lhs] = parseAnd(formula);
	if (!lhs) return [newFormula, null];

	while (newFormula.trim().startsWith("|")) {
		newFormula = removeFirst(newFormula, "|");
		const [newNewFormula, rhs] = parseAnd(newFormula);
		newFormula = newNewFormula;
		if (!rhs) throw new Error("Expected proposition after '|'");
		lhs = {type: "or", lhs, rhs};
	}

	return [newFormula, lhs];
}

function parseThen(formula) {
	let [newFormula, lhs] = parseOr(formula);
	if (!lhs) return [newFormula, null];

	if (newFormula.trim().startsWith("->")) {
		newFormula = removeFirst(newFormula, "->");
		const [newNewFormula, rhs] = parseThen(newFormula);
		newFormula = newNewFormula;
		if (!rhs) throw new Error("Expected proposition after '->'");
		lhs = {type: "then", lhs, rhs};
	}

	return [newFormula, lhs];
}

function parse(formula) {
	return parseThen(formula);
}

let formula = "nothing";

function parseFormula() {
	const rawFormula = document.getElementById("formula").value;
	try {
		const [junk, parsed] = parse(rawFormula);
		formula = parsed;
		if (junk.trim().length) throw new Error("Junk after formula end: '" + junk.trim() + "'");
	} catch (error) {
		document.getElementById("parse-errors").textContent = error.toString();
		return;
	}

	document.getElementById("parse-errors").textContent = "";
	document.getElementById("parsed-formula").value = formulaString(formula);
}

function formulaString(formula) {
	if (typeof formula === "string") return formula;
	switch (formula.type) {
		case "not": return `(~${formulaString(formula.value)})`;
		case "and": return `(${formulaString(formula.lhs)} ∧ ${formulaString(formula.rhs)})`;
		case "or": return `(${formulaString(formula.lhs)} ∨ ${formulaString(formula.rhs)})`;
		case "then": return `(${formulaString(formula.lhs)} → ${formulaString(formula.rhs)})`;
	}
}

function formulasEqual(a, b) {
	if (typeof a === "string") {
		if (typeof b === "string") return a === b;
		return false;
	}
	switch (a.type) {
		case "not":
			if (typeof b === "string") return false;
			if (b.type !== "not") return false;
			return formulasEqual(a.value, b.value);
		case "and":
			if (typeof b === "string") return false;
			if (b.type !== "and") return false;
			return formulasEqual(a.lhs, b.lhs) && formulasEqual(a.rhs, b.rhs);
		case "or":
			if (typeof b === "string") return false;
			if (b.type !== "or") return false;
			return formulasEqual(a.lhs, b.lhs) && formulasEqual(a.rhs, b.rhs);
		case "then":
			if (typeof b === "string") return false;
			if (b.type !== "then") return false;
			return formulasEqual(a.lhs, b.lhs) && formulasEqual(a.rhs, b.rhs);
	}
}

function formulaPropositions(formula) {
	if (typeof formula === "string") return [formula];
	switch (formula.type) {
		case "not": return formulaPropositions(formula.value);
		case "and":
		case "or":
		case "then": return Array.from(new Set([...formulaPropositions(formula.lhs), ...formulaPropositions(formula.rhs)]));
	}
}

function listPropositions() {
	const propositions = formulaPropositions(formula);
	document.getElementById("output").textContent = `Propositions:\n${propositions.map(x => "\t* " + x).join("\n")}`;
}

function splitRequirement(requirement) {
	if (typeof requirement.formula === "string") return requirement;
	switch (requirement.formula.type) {
		case "not": return {formula: requirement.formula.value, value: !requirement.value};
		case "and":
			if (requirement.value) return [
				{formula: requirement.formula.lhs, value: true},
				{formula: requirement.formula.rhs, value: true}
			];
			return requirement;
		case "or":
			if (!requirement.value) return [
				{formula: requirement.formula.lhs, value: false},
				{formula: requirement.formula.rhs, value: false}
			];
			return requirement;
		case "then":
			if (!requirement.value) return [
				{formula: requirement.formula.lhs, value: true},
				{formula: requirement.formula.rhs, value: false}
			];
			return requirement;
	}
}

function applyKnowledge(requirement, knowledge) {
	if (typeof requirement.formula === "string") throw new Error("Somehow reached a proposition");
	switch (requirement.formula.type) {
		case "not": return requirement; // wait for split
		case "and": {
			if (requirement.value) return requirement; // wait for split
			// we want 1 and x/x and 1: 0 to make x: 0
			const lhs = (typeof requirement.formula.lhs === "string")
				? (knowledge[requirement.formula.lhs] ?? requirement.formula.lhs)
				: requirement.formula.lhs;
			const rhs = (typeof requirement.formula.rhs === "string")
				? (knowledge[requirement.formula.rhs] ?? requirement.formula.rhs)
				: requirement.formula.rhs;
			if (!(typeof lhs === "boolean" || typeof rhs === "boolean")) return requirement; // we learnt nothing
			const requirements = [];
			if (typeof lhs === "boolean" && lhs) {
				requirements.push({formula: requirement.formula.rhs, value: false});
			}
			if (typeof rhs === "boolean" && rhs) {
				requirements.push({formula: requirement.formula.lhs, value: false});
			}
			return requirements;
		}
		case "or": {
			if (!requirement.value) return requirement; // wait for split
			// we want 0 or x/x or 0: 1 to make x: 1
			const lhs = (typeof requirement.formula.lhs === "string")
				? (knowledge[requirement.formula.lhs] ?? requirement.formula.lhs)
				: requirement.formula.lhs;
			const rhs = (typeof requirement.formula.rhs === "string")
				? (knowledge[requirement.formula.rhs] ?? requirement.formula.rhs)
				: requirement.formula.rhs;
			if (!(typeof lhs === "boolean" || typeof rhs === "boolean")) return requirement; // we learnt nothing
			const requirements = [];
			if (typeof lhs === "boolean" && !lhs) {
				requirements.push({formula: requirement.formula.rhs, value: true});
			}
			if (typeof rhs === "boolean" && !rhs) {
				requirements.push({formula: requirement.formula.lhs, value: true});
			}
			return requirements;
		}
		case "then": {
			if (!requirement.value) return requirement; // wait for split
			// we want 1 -> x: 1 to make x: 1 and x -> 0: 1 to make x: 0
			const lhs = (typeof requirement.formula.lhs === "string")
				? (knowledge[requirement.formula.lhs] ?? requirement.formula.lhs)
				: requirement.formula.lhs;
			const rhs = (typeof requirement.formula.rhs === "string")
				? (knowledge[requirement.formula.rhs] ?? requirement.formula.rhs)
				: requirement.formula.rhs;
			if (!(typeof lhs === "boolean" || typeof rhs === "boolean")) return requirement; // we learnt nothing
			const requirements = [];
			if (typeof lhs === "boolean" && lhs) {
				requirements.push({formula: requirement.formula.rhs, value: true});
			}
			if (typeof rhs === "boolean" && !rhs) {
				requirements.push({formula: requirement.formula.lhs, value: false});
			}
			return requirements;
		}
	}
}

function evaluate(formula, knowledge) {
	if (typeof formula === "string") return knowledge[formula];
	switch (formula.type) {
		case "not": {
			const value = evaluate(formula.value, knowledge);
			return (value === null) ? null : !value;
		}
		case "and": {
			const lhs = evaluate(formula.lhs, knowledge);
			const rhs = evaluate(formula.rhs, knowledge);
			if (lhs === null || rhs === null) return null;
			return lhs && rhs;
		}
		case "or": {
			const lhs = evaluate(formula.lhs, knowledge);
			const rhs = evaluate(formula.rhs, knowledge);
			if (lhs === null || rhs === null) return null;
			return lhs || rhs;
		}
		case "then": {
			const lhs = evaluate(formula.lhs, knowledge);
			const rhs = evaluate(formula.rhs, knowledge);
			if (lhs === null || rhs === null) return null;
			return !lhs || rhs;
		}
	}
}

function requirementsEqual(a, b) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; ++i) {
		if (a[i].value !== b[i].value) return false;
		if (!formulasEqual(a[i].formula, b[i].formula)) return false;
	}
	return true;
}

function counterexampleSearch() {
	let outerRequirement = {formula, value: false};
	let requirements = [outerRequirement];
	let oldRequirements = [];
	let contradictionFound = false;

	const knowledge = {};
	for (const proposition of formulaPropositions(formula)) {
		knowledge[proposition] = null;
	}

	let iteration = 1;
	let output = document.getElementById("output");
	output.textContent = "";
	while (!requirementsEqual(oldRequirements, requirements)) {
		output.textContent += `Iteration ${iteration++}:\n`;
		output.textContent += `\tRequirements:\n`;
		output.textContent += requirements.length
			? requirements.map(x => `\t\t* ${formulaString(x.formula)}: ${x.value}`).join("\n")
			: "\t\t(none)";
		output.textContent += `\n\tKnowledge:\n`;
		output.textContent += Object.keys(knowledge).map(x => `\t\t* ${x}: ${knowledge[x] === null ? "?" : knowledge[x]}`).join("\n");
		output.textContent += `\n`;
		if (contradictionFound) {
			output.textContent += `\nContradiction found! No counterexample exists.\n`;
			return;
		}
		if (!requirements.length && Object.keys(knowledge).every(x => knowledge[x] !== null)) {
			output.textContent += "\nCounterexample found:\n";
			output.textContent += Object.keys(knowledge).map(x => `\t* ${x}: ${knowledge[x]}`).join("\n");
			return;
		}

		oldRequirements = requirements;
		for (const requirement of requirements) {
			const valid = evaluate(requirement.formula, knowledge);
			if (valid === null) continue;
			if (valid !== requirement.value) {
				output.textContent += `\nContradiction found! No counterexample exists.\n`;
				return;
			}
		}
		requirements = requirements.flatMap(x => applyKnowledge(x, knowledge));
		requirements = requirements.flatMap(x => splitRequirement(x));
		for (const requirement of requirements) {
			if (typeof requirement.formula === "string") {
				if (knowledge[requirement.formula] === null)
					knowledge[requirement.formula] = requirement.value;
				else {
					if (knowledge[requirement.formula] !== requirement.value) {
						contradictionFound = true;
						break;
					}
				}
			}
		}
		requirements = requirements.filter(x => typeof x.formula !== "string");
	}
	output.textContent += "\nStalled!\nThis may be because branching would be required to continue, but it is not implemented yet.";
}