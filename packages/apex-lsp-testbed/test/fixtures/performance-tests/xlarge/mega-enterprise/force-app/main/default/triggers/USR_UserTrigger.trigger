trigger USR_UserTrigger on User (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    USR_BaseService_71.ServiceConfig config =
        new USR_BaseService_71.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            USR_Domain_78 domain =
                new USR_Domain_78();
            USR_Domain_78.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (USR_Domain_78.ValidationError err : validation.errors) {
                    if (err.severity == USR_Domain_78.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        USR_RecordService_73 service =
            new USR_RecordService_73();
        USR_BaseService_71.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'USR trigger error: ' + error);
            }
        }
    }
}
