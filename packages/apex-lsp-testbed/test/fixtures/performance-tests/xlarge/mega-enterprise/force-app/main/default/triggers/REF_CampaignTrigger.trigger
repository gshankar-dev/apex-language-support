trigger REF_CampaignTrigger on Campaign (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    REF_BaseService_421.ServiceConfig config =
        new REF_BaseService_421.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            REF_Domain_428 domain =
                new REF_Domain_428();
            REF_Domain_428.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (REF_Domain_428.ValidationError err : validation.errors) {
                    if (err.severity == REF_Domain_428.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        REF_RecordService_423 service =
            new REF_RecordService_423();
        REF_BaseService_421.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'REF trigger error: ' + error);
            }
        }
    }
}
