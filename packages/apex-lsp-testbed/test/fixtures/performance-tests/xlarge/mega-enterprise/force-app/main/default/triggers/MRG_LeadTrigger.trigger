trigger MRG_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    MRG_BaseService_371.ServiceConfig config =
        new MRG_BaseService_371.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            MRG_Domain_378 domain =
                new MRG_Domain_378();
            MRG_Domain_378.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (MRG_Domain_378.ValidationError err : validation.errors) {
                    if (err.severity == MRG_Domain_378.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        MRG_RecordService_373 service =
            new MRG_RecordService_373();
        MRG_BaseService_371.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'MRG trigger error: ' + error);
            }
        }
    }
}
