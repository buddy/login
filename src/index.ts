import {setFailed, getInput, setOutput} from '@actions/core';
import {context} from '@actions/github';

try {
    const nameToGreet = getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    setOutput("time", time);
    const payload = JSON.stringify(context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    setFailed(error.message);
}