/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 *  User: "Alexa, ask Old McDonald what sound a dog makes?
 *  Alexa: "This is a dog: [sound]"
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    intros = require('./data'),
    audiofiles = require('./audiofiles');

var APP_ID = 'amzn1.ask.skill.7a800506-acc8-4a93-bb3c-57aae42829ed'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var categories  = "cat, dog, lion, woodpecker";  //List of all animals

/**
 * AnimalHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AnimalHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AnimalHelper.prototype = Object.create(AlexaSkill.prototype);
AnimalHelper.prototype.constructor = AnimalHelper;

AnimalHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Old McDonald Alexa skill. You can ask a question like, what sound does a dog make..." +  
                     "... Now, which animal would you like to hear?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

AnimalHelper.prototype.intentHandlers = {
    "SkillIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Item,
            categoryName;
        if (itemSlot && itemSlot.value){
            categoryName = itemSlot.value.toLowerCase();
        }

        var cardTitle,
            intro,
            introIndex,
            audio,
            audioIndex,
            repromptOutput,
            speechOutput;
        
        //Select a random category if one is not provided
        if (categoryName === undefined) {
            var categoryArray = categories.split(', ');
            var categoryIndex = getRandomInt(0, categoryArray.length - 1);
            categoryName = categoryArray[categoryIndex];
        } 
        
        //Lookup joke and cardTitle only when category is valid
        if (isValidCategory(categoryName)) {
            introIndex = getRandomInt(0, intros[categoryName].length - 1),
            intro = intros[categoryName][introIndex];
            audioIndex = getRandomInt(0, audiofiles[categoryName].length - 1),
            audio = audiofiles[categoryName][audioIndex];
            cardTitle = "Sound for animal: " + categoryName
        }        
        if (intro) {
            speechOutput = {
                speech: "<speak>" + intro + "<audio src='" + audio + "'/></speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            response.tellWithCard(speechOutput, cardTitle, intro);
        } else {
            var speech;
            if (categoryName) {
                speech = "I'm sorry, I currently do not have a sound for " + categoryName + " .. Please try another.";
            } else {
                speech = "I'm sorry, I currently do not have a sound for " + categoryName + " .. Please try another.";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask a question like, what sound does a dog make..." + 
            "... Or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can ask a question like, what sound does a dog make..." + 
            "... Or, you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var animalHelper = new AnimalHelper();
    animalHelper.execute(event, context);
};


//Returns a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Determine if an item is in the category list
function isValidCategory(txt) {
    var found = true;
    if (categories.indexOf(txt) === -1) {
        found = false;
    }
  return found;
}