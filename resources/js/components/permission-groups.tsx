import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PermissionGroupsProps {
    permissions: string[];
    selectedPermissions: string[];
    onChange?: (permission: string, checked: boolean) => void;
    readOnly?: boolean;
}

interface GroupedPermissions {
    [key: string]: string[];
}

export function PermissionGroups({ permissions, selectedPermissions, onChange, readOnly }: PermissionGroupsProps) {
    const groupedPermissions = React.useMemo(() => {
        return permissions.reduce((groups: GroupedPermissions, permission) => {
            const [module] = permission.split('.');
            const groupName = module.charAt(0).toUpperCase() + module.slice(1);

            if (!groups[groupName]) {
                groups[groupName] = [];
            }

            groups[groupName].push(permission);
            return groups;
        }, {});
    }, [permissions]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                <Card key={groupName}>
                    <CardHeader>
                        <CardTitle className="text-lg">{groupName} Permissions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {groupPermissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                    id={permission}
                                    checked={selectedPermissions.includes(permission)}
                                    onCheckedChange={
                                        readOnly
                                            ? undefined
                                            : (checked) => onChange?.(permission, checked as boolean)
                                    }
                                    disabled={readOnly}
                                />
                                <Label
                                    htmlFor={permission}
                                    className="text-sm capitalize"
                                >
                                    {permission.split('.')[1]}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
