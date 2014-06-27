exports.init = function(){
    GLOBAL.roleEnum = {
        organizer: "organizer",
        speaker: "speaker"
    };

    GLOBAL.infoTypeEnum = {
        postalCode: "postalCode",
        company: "company"
    };

    GLOBAL.eventSessionStatusEnum = {
        pending: 'pending',
        accepted: 'accepted',
        declined: 'declined',
        complete: 'complete'
    };
}