trigger YAM_UserTrigger on User (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    YAM_BaseService_751.ServiceConfig config =
        new YAM_BaseService_751.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            YAM_Domain_758 domain =
                new YAM_Domain_758();
            YAM_Domain_758.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (YAM_Domain_758.ValidationError err : validation.errors) {
                    if (err.severity == YAM_Domain_758.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        YAM_RecordService_753 service =
            new YAM_RecordService_753();
        YAM_BaseService_751.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'YAM trigger error: ' + error);
            }
        }
    }
}
