trigger EXP_CaseTrigger on Case (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    EXP_BaseService_551.ServiceConfig config =
        new EXP_BaseService_551.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            EXP_Domain_558 domain =
                new EXP_Domain_558();
            EXP_Domain_558.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (EXP_Domain_558.ValidationError err : validation.errors) {
                    if (err.severity == EXP_Domain_558.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        EXP_RecordService_553 service =
            new EXP_RecordService_553();
        EXP_BaseService_551.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'EXP trigger error: ' + error);
            }
        }
    }
}
