trigger ZIP_CampaignTrigger on Campaign (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ZIP_BaseService_761.ServiceConfig config =
        new ZIP_BaseService_761.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ZIP_Domain_768 domain =
                new ZIP_Domain_768();
            ZIP_Domain_768.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ZIP_Domain_768.ValidationError err : validation.errors) {
                    if (err.severity == ZIP_Domain_768.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ZIP_RecordService_763 service =
            new ZIP_RecordService_763();
        ZIP_BaseService_761.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ZIP trigger error: ' + error);
            }
        }
    }
}
