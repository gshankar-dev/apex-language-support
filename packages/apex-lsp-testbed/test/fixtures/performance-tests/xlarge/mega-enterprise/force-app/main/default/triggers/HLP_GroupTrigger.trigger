trigger HLP_GroupTrigger on Group (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    HLP_BaseService_841.ServiceConfig config =
        new HLP_BaseService_841.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            HLP_Domain_848 domain =
                new HLP_Domain_848();
            HLP_Domain_848.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (HLP_Domain_848.ValidationError err : validation.errors) {
                    if (err.severity == HLP_Domain_848.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        HLP_RecordService_843 service =
            new HLP_RecordService_843();
        HLP_BaseService_841.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'HLP trigger error: ' + error);
            }
        }
    }
}
