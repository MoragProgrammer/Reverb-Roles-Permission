<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Events\RoleCreated;
use App\Events\RoleUpdated;
use App\Events\RoleDeleted;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Roles/Index", [
            "roles" => Role::with("permissions")->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Roles/Create",[
            "permissions" => Permission::pluck("name")
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|unique:roles,name",
            "badge_color" => "required|regex:/^#[A-Fa-f0-9]{6}$/",
            "permissions" => "required|array"
        ]);

        $role = Role::create([
            "name" => $request->name,
            "badge_color" => $request->badge_color
        ]);

        $role->syncPermissions($request->permissions);

        RoleCreated::dispatch($role->load('permissions'));

        return to_route("roles.index");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::find($id);
        return Inertia::render("Roles/Show", [
            "role" => $role,
            "permissions" => $role->permissions()->pluck("name"),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $role = Role::find($id);
        return Inertia::render("Roles/Edit", [
            "role" => $role,
            "rolePermissions" => $role->permissions()->pluck("name"),
            "permissions" => Permission::pluck("name")
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            "name" => "required|unique:roles,name," . $role->id,
            "badge_color" => "required|regex:/^#[A-Fa-f0-9]{6}$/",
            "permissions" => "required|array"
        ]);

        $role->update([
            "name" => $request->name,
            "badge_color" => $request->badge_color
        ]);

        $role->syncPermissions($request->permissions);

        RoleUpdated::dispatch($role->load('permissions'));

        return to_route("roles.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);

        RoleDeleted::dispatch($role);

        $role->delete();

        return to_route("roles.index");
    }
}
